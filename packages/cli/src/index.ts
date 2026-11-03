#!/usr/bin/env node
import { generateBlueprint } from '@aidevme/blueprint-core';
import { parseCliArgs, USAGE } from './args.js';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(USAGE);
} else {
  try {
    await generateBlueprint(parseCliArgs(args));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
