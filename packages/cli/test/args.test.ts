import { describe, expect, it } from 'vitest';
import { parseCliArgs } from '../src/args.js';

const required = ['generate', '--env-url', 'https://contoso.crm4.dynamics.com', '--solutions'];

describe('parseCliArgs', () => {
  it('applies the documented defaults', () => {
    expect(parseCliArgs([...required, 'ContosoCore'])).toEqual({
      environmentUrl: 'https://contoso.crm4.dynamics.com',
      solutions: ['ContosoCore'],
      publishers: [],
      formats: ['md'],
      outputDir: './blueprint',
      failOn: [],
      includeSystem: false,
    });
  });

  it('reads every option', () => {
    const options = parseCliArgs([
      ...required,
      'ContosoCore,ContosoSales',
      '--publishers',
      'cnto',
      '--format',
      'md,json',
      '--out',
      './docs/blueprint',
      '--fail-on',
      'high-risk',
      '--include-system',
    ]);

    expect(options.solutions).toEqual(['ContosoCore', 'ContosoSales']);
    expect(options.publishers).toEqual(['cnto']);
    expect(options.formats).toEqual(['md', 'json']);
    expect(options.outputDir).toBe('./docs/blueprint');
    expect(options.failOn).toEqual(['high-risk']);
    expect(options.includeSystem).toBe(true);
  });

  it('requires --solutions', () => {
    expect(() =>
      parseCliArgs(['generate', '--env-url', 'https://contoso.crm4.dynamics.com']),
    ).toThrow('At least one solution unique name');
  });

  it('requires --env-url', () => {
    expect(() => parseCliArgs(['generate', '--solutions', 'ContosoCore'])).toThrow(
      '--env-url is required',
    );
  });

  it('rejects an unknown command', () => {
    expect(() => parseCliArgs(['export'])).toThrow('Unknown command');
  });
});
