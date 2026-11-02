// ../core/dist/generate.js
async function generateBlueprint(_options) {
  throw new Error("Blueprint generation is not implemented yet.");
}

// ../core/dist/types.js
var OUTPUT_FORMATS = ["md", "html", "json", "zip"];
var FAIL_ON_FINDINGS = ["high-risk", "external-sync", "deprecated"];

// ../core/dist/options.js
function parseList(value) {
  const items = (value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  return [...new Set(items)];
}
function parseAllowed(value, allowed, label) {
  return parseList(value).map((item) => {
    if (!allowed.includes(item)) {
      throw new Error(`Unknown ${label} "${item}". Use: ${allowed.join(", ")}.`);
    }
    return item;
  });
}
function parseSolutions(value) {
  const solutions = parseList(value);
  if (solutions.length === 0) {
    throw new Error("At least one solution unique name is required.");
  }
  return solutions;
}
function parseFormats(value) {
  const formats = parseAllowed(value, OUTPUT_FORMATS, "format");
  return formats.length > 0 ? formats : ["md"];
}
function parseFailOn(value) {
  return parseAllowed(value, FAIL_ON_FINDINGS, "fail-on value");
}

// src/index.ts
function getInput(name) {
  return process.env[`INPUT_${name.toUpperCase()}`]?.trim() ?? "";
}
try {
  await generateBlueprint({
    environmentUrl: getInput("environment-url"),
    solutions: parseSolutions(getInput("solutions")),
    publishers: [],
    formats: parseFormats(getInput("formats")),
    outputDir: getInput("output-dir") || "./blueprint",
    failOn: parseFailOn(getInput("fail-on")),
    includeSystem: false
  });
} catch (error) {
  console.log(`::error::${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
}
