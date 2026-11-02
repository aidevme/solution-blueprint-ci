import {
  generateBlueprint,
  parseFailOn,
  parseFormats,
  parseSolutions,
} from '@aidevme/blueprint-core';

function getInput(name: string): string {
  return process.env[`INPUT_${name.toUpperCase()}`]?.trim() ?? '';
}

function run(): Promise<void> {
  return generateBlueprint({
    environmentUrl: process.env[`ENDPOINT_URL_${getInput('connection')}`] ?? '',
    solutions: parseSolutions(getInput('solutions')),
    publishers: [],
    formats: parseFormats(getInput('formats')),
    outputDir: getInput('outputDir') || './blueprint',
    failOn: parseFailOn(getInput('failOn')),
    includeSystem: false,
  });
}

Promise.resolve()
  .then(run)
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`##vso[task.logissue type=error]${message}`);
    console.log(`##vso[task.complete result=Failed;]${message}`);
  });
