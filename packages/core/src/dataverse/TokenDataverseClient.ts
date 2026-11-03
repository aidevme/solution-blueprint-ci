import type { IDataverseClient, QueryOptions, QueryResult } from './IDataverseClient.js';
import type { TokenProvider } from './tokenProvider.js';

const API_PATH = '/api/data/v9.2/';
const BASE_DELAY_MS = 1000;
const DEFAULT_MAX_ATTEMPTS = 5;

export interface TokenDataverseClientOptions {
  maxAttempts?: number;
  sleep?: (ms: number) => Promise<void>;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  return BASE_DELAY_MS * 2 ** (attempt - 1);
}

function isTransient(status: number): boolean {
  return status === 429 || status >= 500;
}

/** Dataverse sends Retry-After in seconds when service protection limits apply. */
function retryDelayMs(response: Response, attempt: number): number {
  const header = response.headers.get('retry-after');
  const seconds = header === null ? Number.NaN : Number(header);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : backoffMs(attempt);
}

async function describeFailure(response: Response): Promise<string> {
  const body = (await response.json().catch(() => undefined)) as
    | { error?: { message?: string } }
    | undefined;
  const message = body?.error?.message;
  return message ? `HTTP ${response.status}: ${message}` : `HTTP ${response.status}`;
}

function buildQueryString(options?: QueryOptions): string {
  if (!options) {
    return '';
  }

  const params: string[] = [];

  if (options.select?.length) {
    params.push(`$select=${encodeURIComponent(options.select.join(','))}`);
  }
  if (options.filter) {
    params.push(`$filter=${encodeURIComponent(options.filter)}`);
  }
  if (options.expand) {
    params.push(`$expand=${encodeURIComponent(options.expand)}`);
  }
  if (options.orderBy?.length) {
    params.push(`$orderby=${encodeURIComponent(options.orderBy.join(','))}`);
  }
  if (options.top !== undefined) {
    params.push(`$top=${options.top}`);
  }

  return params.join('&');
}

function parseResponse<T>(response: unknown): QueryResult<T> {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from Dataverse');
  }

  const data = response as Record<string, unknown>;

  if (Array.isArray(data.value)) {
    return {
      value: data.value as T[],
      count: typeof data['@odata.count'] === 'number' ? data['@odata.count'] : undefined,
      nextLink: typeof data['@odata.nextLink'] === 'string' ? data['@odata.nextLink'] : undefined,
    };
  }

  // A query by ID returns the record itself, without a value wrapper.
  if (data['@odata.context']) {
    return { value: [data as T], count: 1 };
  }

  throw new Error('Response does not contain a value array or single item');
}

/** Dataverse Web API client for headless runs, authenticated with a bearer token. */
export class TokenDataverseClient implements IDataverseClient {
  private readonly origin: string;
  private readonly getToken: TokenProvider;
  private readonly maxAttempts: number;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(
    environmentUrl: string,
    getToken: TokenProvider,
    options: TokenDataverseClientOptions = {},
  ) {
    const url = new URL(environmentUrl);
    if (url.protocol !== 'https:') {
      throw new Error('The Dataverse environment URL must use https.');
    }
    this.origin = url.origin;
    this.getToken = getToken;
    this.maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    this.sleep = options.sleep ?? wait;
  }

  getEnvironmentUrl(): string {
    return this.origin;
  }

  query<T>(entitySet: string, options?: QueryOptions): Promise<QueryResult<T>> {
    return this.get<T>(this.buildUrl(entitySet, options), `query ${entitySet}`);
  }

  queryMetadata<T>(metadataPath: string, options?: QueryOptions): Promise<QueryResult<T>> {
    return this.get<T>(this.buildUrl(metadataPath, options), `query metadata ${metadataPath}`);
  }

  /** Follows @odata.nextLink, because $skip isn't supported on every entity set. */
  async queryAll<T>(
    entitySet: string,
    options?: Omit<QueryOptions, 'top'>,
  ): Promise<QueryResult<T>> {
    let page = await this.query<T>(entitySet, options);
    const count = page.count;
    const value = [...page.value];

    while (page.nextLink) {
      // The bearer token must never leave the environment it was issued for.
      if (new URL(page.nextLink).origin !== this.origin) {
        throw new Error(`Refused @odata.nextLink outside ${this.origin}`);
      }
      page = await this.get<T>(page.nextLink, `query ${entitySet} (pagination)`);
      value.push(...page.value);
    }

    return { value, count };
  }

  private buildUrl(path: string, options?: QueryOptions): string {
    const queryString = buildQueryString(options);
    return `${this.origin}${API_PATH}${path}${queryString ? `?${queryString}` : ''}`;
  }

  private async get<T>(url: string, label: string): Promise<QueryResult<T>> {
    try {
      return parseResponse<T>(await this.fetchJson(url));
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to ${label}: ${reason}`);
    }
  }

  private async fetchJson(url: string): Promise<unknown> {
    for (let attempt = 1; ; attempt++) {
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${await this.getToken()}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        // The discovery code reads formatted values, such as owner names.
        Prefer: 'odata.include-annotations="*"',
      };

      let response: Response;
      try {
        response = await fetch(url, { headers });
      } catch (error) {
        if (attempt >= this.maxAttempts) {
          throw error;
        }
        await this.sleep(backoffMs(attempt));
        continue;
      }

      if (response.ok) {
        return response.json();
      }
      if (!isTransient(response.status) || attempt >= this.maxAttempts) {
        throw new Error(await describeFailure(response));
      }
      await this.sleep(retryDelayMs(response, attempt));
    }
  }
}
