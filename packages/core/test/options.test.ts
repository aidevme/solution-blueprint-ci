import { describe, expect, it } from 'vitest';
import { parseFailOn, parseFormats, parseSolutions } from '../src/options.js';

describe('parseSolutions', () => {
  it('accepts one unique name', () => {
    expect(parseSolutions('ContosoCore')).toEqual(['ContosoCore']);
  });

  it('accepts several unique names and removes duplicates', () => {
    expect(parseSolutions(' ContosoCore, ContosoSales,ContosoCore ')).toEqual([
      'ContosoCore',
      'ContosoSales',
    ]);
  });

  it.each([undefined, '', ' , '])('rejects %j', (value) => {
    expect(() => parseSolutions(value)).toThrow('At least one solution unique name');
  });
});

describe('parseFormats', () => {
  it('defaults to Markdown', () => {
    expect(parseFormats(undefined)).toEqual(['md']);
  });

  it('accepts several formats', () => {
    expect(parseFormats('md,html,json')).toEqual(['md', 'html', 'json']);
  });

  it('rejects an unknown format', () => {
    expect(() => parseFormats('pdf')).toThrow('Unknown format "pdf"');
  });
});

describe('parseFailOn', () => {
  it('defaults to none', () => {
    expect(parseFailOn(undefined)).toEqual([]);
  });

  it('rejects an unknown finding', () => {
    expect(() => parseFailOn('critical')).toThrow('Unknown fail-on value "critical"');
  });
});
