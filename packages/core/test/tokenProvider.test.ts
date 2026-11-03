import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createTokenProvider,
  readCredentialsFromEnv,
} from '../src/dataverse/tokenProvider.js';

const ENV_URL = 'https://contoso.crm4.dynamics.com/';
const IDS = { AZURE_TENANT_ID: 'tenant', AZURE_CLIENT_ID: 'client' };

function tokenResponse(token: string, expiresIn = 3600): Response {
  return new Response(JSON.stringify({ access_token: token, expires_in: expiresIn }));
}

describe('readCredentialsFromEnv', () => {
  it('requires the tenant and client IDs', () => {
    expect(() => readCredentialsFromEnv({ AZURE_CLIENT_SECRET: 'x' })).toThrow(
      'AZURE_TENANT_ID and AZURE_CLIENT_ID are required.',
    );
  });

  it('requires a secret or a federated token file', () => {
    expect(() => readCredentialsFromEnv(IDS)).toThrow('AZURE_FEDERATED_TOKEN_FILE');
  });

  it('prefers the client secret', () => {
    const credentials = readCredentialsFromEnv({
      ...IDS,
      AZURE_CLIENT_SECRET: 'secret',
      AZURE_FEDERATED_TOKEN_FILE: 'token.txt',
    });

    expect(credentials).toEqual({ tenantId: 'tenant', clientId: 'client', clientSecret: 'secret' });
  });

  it('reads the federated token file on each request', async () => {
    const folder = await mkdtemp(join(tmpdir(), 'blueprint-'));
    const file = join(folder, 'token.txt');

    try {
      const credentials = readCredentialsFromEnv({ ...IDS, AZURE_FEDERATED_TOKEN_FILE: file });
      if (!('getFederatedToken' in credentials)) {
        throw new Error('Expected federated credentials');
      }

      await writeFile(file, 'first\n');
      await expect(credentials.getFederatedToken()).resolves.toBe('first');
      await writeFile(file, 'second\n');
      await expect(credentials.getFederatedToken()).resolves.toBe('second');
    } finally {
      await rm(folder, { recursive: true });
    }
  });
});

describe('createTokenProvider', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const secret = { tenantId: 'tenant', clientId: 'client', clientSecret: 'secret' };

  function sentForm(): URLSearchParams {
    return fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams;
  }

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('requests a token for the environment with a client secret', async () => {
    fetchMock.mockResolvedValue(tokenResponse('abc'));

    await expect(createTokenProvider(ENV_URL, secret)()).resolves.toBe('abc');

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      'https://login.microsoftonline.com/tenant/oauth2/v2.0/token',
    );
    expect(Object.fromEntries(sentForm())).toEqual({
      client_id: 'client',
      scope: 'https://contoso.crm4.dynamics.com/.default',
      grant_type: 'client_credentials',
      client_secret: 'secret',
    });
  });

  it('sends a federated token as a client assertion', async () => {
    fetchMock.mockResolvedValue(tokenResponse('abc'));
    const federated = {
      tenantId: 'tenant',
      clientId: 'client',
      getFederatedToken: async () => 'oidc-token',
    };

    await createTokenProvider(ENV_URL, federated)();

    expect(sentForm().get('client_assertion')).toBe('oidc-token');
    expect(sentForm().get('client_assertion_type')).toBe(
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    );
    expect(sentForm().has('client_secret')).toBe(false);
  });

  it('shares one request between parallel callers and reuses the token', async () => {
    fetchMock.mockImplementation(async () => tokenResponse('abc'));
    const getToken = createTokenProvider(ENV_URL, secret);

    await expect(Promise.all([getToken(), getToken()])).resolves.toEqual(['abc', 'abc']);
    await getToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('requests a new token shortly before the old one expires', async () => {
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(tokenResponse('first', 3600))
      .mockResolvedValueOnce(tokenResponse('second', 3600));
    const getToken = createTokenProvider(ENV_URL, secret);

    await getToken();
    vi.advanceTimersByTime(3540 * 1000);

    await expect(getToken()).resolves.toBe('second');
  });

  it('reports the reason from Entra ID and tries again on the next call', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error_description: 'AADSTS7000215' }), { status: 401 }),
      )
      .mockResolvedValueOnce(tokenResponse('abc'));
    const getToken = createTokenProvider(ENV_URL, secret);

    await expect(getToken()).rejects.toThrow('Could not get a Dataverse token: AADSTS7000215');
    await expect(getToken()).resolves.toBe('abc');
  });
});
