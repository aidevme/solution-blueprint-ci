import { readFile } from 'node:fs/promises';

const AUTHORITY = 'https://login.microsoftonline.com';
const CLIENT_ASSERTION_TYPE = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';
const EXPIRY_MARGIN_MS = 60_000;

export type TokenProvider = () => Promise<string>;

interface ServicePrincipal {
  tenantId: string;
  clientId: string;
}

export type ServicePrincipalCredentials = ServicePrincipal &
  ({ clientSecret: string } | { getFederatedToken: () => Promise<string> });

interface AccessToken {
  value: string;
  expiresAt: number;
}

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

/** A client secret takes precedence over a federated token file. */
export function readCredentialsFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): ServicePrincipalCredentials {
  const {
    AZURE_TENANT_ID: tenantId,
    AZURE_CLIENT_ID: clientId,
    AZURE_CLIENT_SECRET: clientSecret,
    AZURE_FEDERATED_TOKEN_FILE: tokenFile,
  } = env;

  if (!tenantId || !clientId) {
    throw new Error('AZURE_TENANT_ID and AZURE_CLIENT_ID are required.');
  }
  if (clientSecret) {
    return { tenantId, clientId, clientSecret };
  }
  if (tokenFile) {
    // Read on every token request, because the platform rotates this file.
    const getFederatedToken = async () => (await readFile(tokenFile, 'utf8')).trim();
    return { tenantId, clientId, getFederatedToken };
  }
  throw new Error('Set AZURE_CLIENT_SECRET or AZURE_FEDERATED_TOKEN_FILE.');
}

async function requestToken(
  scope: string,
  credentials: ServicePrincipalCredentials,
): Promise<AccessToken> {
  const form = new URLSearchParams({
    client_id: credentials.clientId,
    scope,
    grant_type: 'client_credentials',
  });

  if ('clientSecret' in credentials) {
    form.set('client_secret', credentials.clientSecret);
  } else {
    form.set('client_assertion_type', CLIENT_ASSERTION_TYPE);
    form.set('client_assertion', await credentials.getFederatedToken());
  }

  const tenant = encodeURIComponent(credentials.tenantId);
  const response = await fetch(`${AUTHORITY}/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    body: form,
  });
  const body = (await response.json().catch(() => ({}))) as TokenResponse;

  if (!response.ok || !body.access_token) {
    const reason = body.error_description ?? body.error ?? `HTTP ${response.status}`;
    throw new Error(`Could not get a Dataverse token: ${reason}`);
  }

  return {
    value: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 0) * 1000 - EXPIRY_MARGIN_MS,
  };
}

/** Caches the token until shortly before it expires; parallel callers share one request. */
export function createTokenProvider(
  environmentUrl: string,
  credentials: ServicePrincipalCredentials,
): TokenProvider {
  const scope = `${new URL(environmentUrl).origin}/.default`;
  let token: AccessToken | undefined;
  let pending: Promise<AccessToken> | undefined;

  return async () => {
    if (token && token.expiresAt > Date.now()) {
      return token.value;
    }
    pending ??= requestToken(scope, credentials)
      .then((fresh) => (token = fresh))
      .finally(() => {
        pending = undefined;
      });
    return (await pending).value;
  };
}
