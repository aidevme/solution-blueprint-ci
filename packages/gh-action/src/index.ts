import {
  generateBlueprint,
  parseFailOn,
  parseFormats,
  parseSolutions,
} from '@aidevme/blueprint-core';

function getInput(name: string): string {
  return process.env[`INPUT_${name.toUpperCase()}`]?.trim() ?? '';
}

try {
  await generateBlueprint({
    environmentUrl: getInput('environment-url'),
    solutions: parseSolutions(getInput('solutions')),
    publishers: [],
    formats: parseFormats(getInput('formats')),
    outputDir: getInput('output-dir') || './blueprint',
    failOn: parseFailOn(getInput('fail-on')),
    includeSystem: false,
  });
} catch (error) {
  console.log(`::error::${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
}
