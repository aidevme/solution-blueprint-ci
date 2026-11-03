import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenDataverseClient } from '../src/dataverse/TokenDataverseClient.js';

const ORIGIN = 'https://contoso.crm4.dynamics.com';
const API = `${ORIGIN}/api/data/v9.2`;

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

describe('TokenDataverseClient', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const sleep = vi.fn(async (_ms: number) => {});
  const client = new TokenDataverseClient(`${ORIGIN}/`, async () => 'test-token', { sleep });

  function requestedUrl(call: number): string {
    return String(fetchMock.mock.calls[call]?.[0]);
  }

  beforeEach(() => {
    fetchMock.mockReset();
    sleep.mockClear();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('refuses an environment URL without https', () => {
    expect(() => new TokenDataverseClient('http://contoso.crm4.dynamics.com', async () => 't'))
      .toThrow('must use https');
  });

  it('returns the environment URL without a trailing slash', () => {
    expect(client.getEnvironmentUrl()).toBe(ORIGIN);
  });

  it('builds an encoded query and sends the token and annotation headers', async () => {
    fetchMock.mockResolvedValue(json({ value: [{ name: 'a' }] }));

    const result = await client.query('solutions', {
      select: ['solutionid', 'uniquename'],
      filter: "uniquename eq 'A&B'",
      orderBy: ['uniquename asc'],
      top: 5,
    });

    expect(requestedUrl(0)).toBe(
      `${API}/solutions?$select=solutionid%2Cuniquename` +
        '&$filter=uniquename%20eq%20\'A%26B\'&$orderby=uniquename%20asc&$top=5',
    );
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      Authorization: 'Bearer test-token',
      Prefer: 'odata.include-annotations="*"',
    });
    expect(result.value).toEqual([{ name: 'a' }]);
  });

  it('wraps a single record in an array', async () => {
    const record = { '@odata.context': 'x', LogicalName: 'account' };
    fetchMock.mockResolvedValue(json(record));

    const result = await client.queryMetadata("EntityDefinitions(LogicalName='account')");

    expect(requestedUrl(0)).toBe(`${API}/EntityDefinitions(LogicalName='account')`);
    expect(result).toEqual({ value: [record], count: 1 });
  });

  it('follows @odata.nextLink and keeps the first page count', async () => {
    const nextLink = `${API}/customapis?$skiptoken=abc`;
    fetchMock
      .mockResolvedValueOnce(json({ value: [1], '@odata.count': 2, '@odata.nextLink': nextLink }))
      .mockResolvedValueOnce(json({ value: [2] }));

    const result = await client.queryAll<number>('customapis');

    expect(requestedUrl(1)).toBe(nextLink);
    expect(result).toEqual({ value: [1, 2], count: 2 });
  });

  it('does not send the token to a nextLink on another host', async () => {
    fetchMock.mockResolvedValue(
      json({ value: [1], '@odata.nextLink': 'https://attacker.example/api/data/v9.2/x' }),
    );

    await expect(client.queryAll('customapis')).rejects.toThrow('Refused @odata.nextLink');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('waits for Retry-After when throttled', async () => {
    fetchMock
      .mockResolvedValueOnce(json({}, 429, { 'Retry-After': '7' }))
      .mockResolvedValueOnce(json({ value: [] }));

    await client.query('solutions');

    expect(sleep).toHaveBeenCalledExactlyOnceWith(7000);
  });

  it('backs off on server and network errors', async () => {
    fetchMock
      .mockResolvedValueOnce(json({}, 503))
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(json({ value: [] }));

    await client.query('solutions');

    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([1000, 2000]);
  });

  it('gives up after the last attempt', async () => {
    const limited = new TokenDataverseClient(ORIGIN, async () => 't', { sleep, maxAttempts: 2 });
    fetchMock.mockImplementation(async () => json({ error: { message: 'Busy' } }, 503));

    await expect(limited.query('solutions')).rejects.toThrow(
      'Failed to query solutions: HTTP 503: Busy',
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([400, 401, 403, 404])('does not retry HTTP %i', async (status) => {
    fetchMock.mockResolvedValue(json({ error: { message: 'No' } }, status));

    await expect(client.query('solutions')).rejects.toThrow(`HTTP ${status}: No`);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects a response that has neither records nor a record', async () => {
    fetchMock.mockResolvedValue(json({ unexpected: true }));

    await expect(client.query('solutions')).rejects.toThrow('does not contain a value array');
  });
});
