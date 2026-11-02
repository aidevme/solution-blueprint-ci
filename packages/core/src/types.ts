export const OUTPUT_FORMATS = ['md', 'html', 'json', 'zip'] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export const FAIL_ON_FINDINGS = ['high-risk', 'external-sync', 'deprecated'] as const;
export type FailOnFinding = (typeof FAIL_ON_FINDINGS)[number];

export interface BlueprintOptions {
  environmentUrl: string;
  /** Solution unique names, not display names. */
  solutions: string[];
  publishers: string[];
  formats: OutputFormat[];
  outputDir: string;
  failOn: FailOnFinding[];
  includeSystem: boolean;
}
