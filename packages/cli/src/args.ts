import { parseArgs } from 'node:util';
import {
  parseFailOn,
  parseFormats,
  parseList,
  parseSolutions,
  type BlueprintOptions,
} from '@aidevme/blueprint-core';

export const USAGE = `Usage: blueprint generate --env-url <url> --solutions <names> [options]

Options:
  --env-url <url>       Dataverse environment URL (required)
  --solutions <names>   One solution unique name, or several separated by commas (required)
  --publishers <names>  Comma-separated publisher prefixes
  --format <formats>    md, html, json, zip, separated by commas (default: md)
  --out <dir>           Output directory (default: ./blueprint)
  --fail-on <findings>  high-risk, external-sync, deprecated, separated by commas
  --include-system      Include system tables
  -h, --help            Show this help`;

export function parseCliArgs(args: string[]): BlueprintOptions {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      'env-url': { type: 'string' },
      solutions: { type: 'string' },
      publishers: { type: 'string' },
      format: { type: 'string' },
      out: { type: 'string', default: './blueprint' },
      'fail-on': { type: 'string' },
      'include-system': { type: 'boolean', default: false },
    },
  });

  if (positionals[0] !== 'generate') {
    throw new Error('Unknown command. Use: blueprint generate.');
  }
  const environmentUrl = values['env-url'];
  if (!environmentUrl) {
    throw new Error('--env-url is required.');
  }

  return {
    environmentUrl,
    solutions: parseSolutions(values.solutions),
    publishers: parseList(values.publishers),
    formats: parseFormats(values.format),
    outputDir: values.out,
    failOn: parseFailOn(values['fail-on']),
    includeSystem: values['include-system'],
  };
}
