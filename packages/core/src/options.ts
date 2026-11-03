import {
  FAIL_ON_FINDINGS,
  OUTPUT_FORMATS,
  type FailOnFinding,
  type OutputFormat,
} from './types.js';

export function parseList(value: string | undefined): string[] {
  const items = (value ?? '').split(',').map((item) => item.trim()).filter(Boolean);
  return [...new Set(items)];
}

function parseAllowed<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  label: string,
): T[] {
  return parseList(value).map((item) => {
    if (!allowed.includes(item as T)) {
      throw new Error(`Unknown ${label} "${item}". Use: ${allowed.join(', ')}.`);
    }
    return item as T;
  });
}

export function parseSolutions(value: string | undefined): string[] {
  const solutions = parseList(value);
  if (solutions.length === 0) {
    throw new Error('At least one solution unique name is required.');
  }
  return solutions;
}

export function parseFormats(value: string | undefined): OutputFormat[] {
  const formats = parseAllowed(value, OUTPUT_FORMATS, 'format');
  return formats.length > 0 ? formats : ['md'];
}

export function parseFailOn(value: string | undefined): FailOnFinding[] {
  return parseAllowed(value, FAIL_ON_FINDINGS, 'fail-on value');
}
