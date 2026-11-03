# What it documents

## Discovery

Everything PPSB documents, including:

- Tables, columns, relationships, keys, forms and views
- Plugin assemblies and steps (stage, rank, mode, filtering attributes, images)
- Power Automate flows, classic workflows, business rules and business process flows
- JavaScript web resources, PCF controls, custom APIs and custom connectors
- Environment variables and connection references (with premium connector detection)
- Model-driven apps, canvas apps, custom pages and Copilot Studio agents
- Security roles, field security profiles and attribute masking rules

## Analysis

- Entity relationship diagram (Mermaid)
- Entity relationship diagram (Draw.io)
- Execution pipeline per table (client → sync → async)
- Cross-entity automation chains
- External dependency detection with risk scoring
- Solution distribution and shared component detection
- Complexity scoring and performance risk detection

## CI/CD-specific

- Non-interactive authentication: client secret or workload identity federation (OIDC)
- Quality gates: fail the build on high-risk findings (`--fail-on`)
- Deterministic output, so documentation diffs are meaningful in pull requests
- JSON output suitable for archiving and future baseline comparison
