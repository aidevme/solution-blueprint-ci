# solution-blueprint-ci

![An automated pipeline feeds a glowing engine that produces an entity relationship diagram, a document with a flowchart, and a report with charts.](assets/solution-blueprint-ci-preview.png)

> Generate architecture documentation for Power Platform & Dataverse solutions in CI/CD.

![Status](https://img.shields.io/badge/status-early%20development-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)

**solution-blueprint-ci** is a headless documentation engine for Dataverse and Power Platform solutions. It is built on the analysis engine of [Power Platform Solution Blueprint (PPSB)](https://github.com/sabrish/power-platform-solution-blueprint) and packaged for pipelines:

- an **npm CLI** for any CI system or your local machine
- a **GitHub Action** for GitHub workflows
- an **Azure DevOps task** (pipeline extension) for Azure Pipelines

Each run connects to a Dataverse environment with a service principal, discovers the selected solutions, and exports a complete blueprint as **Markdown** (ready for Azure DevOps Wiki), **HTML** (for stakeholders) and **JSON** (for automation and baselines).

**Documentation:** [aidevme.github.io/solution-blueprint-ci](https://aidevme.github.io/solution-blueprint-ci/)

> [!NOTE]
> This project is in early development. The commands, inputs and package names below describe the target design and may change before the first release.

---

## Why

PPSB produces excellent blueprints, but it runs interactively inside PPTB Desktop. Documentation that depends on someone remembering to click "Generate" goes stale. **solution-blueprint-ci** runs the same analysis on every build or release, so your solution documentation is always current, versioned, and reviewable in pull requests.

## Features

**Discovery** — everything PPSB documents, including:

- Tables, columns, relationships, keys, forms and views
- Plugin assemblies and steps (stage, rank, mode, filtering attributes, images)
- Power Automate flows, classic workflows, business rules and business process flows
- JavaScript web resources, PCF controls, custom APIs and custom connectors
- Environment variables and connection references (with premium connector detection)
- Model-driven apps, canvas apps, custom pages and Copilot Studio agents
- Security roles, field security profiles and attribute masking rules

**Analysis**

- Entity relationship diagram (Mermaid)
- Entity relationship diagram (Draw.io)
- Execution pipeline per table (client → sync → async)
- Cross-entity automation chains
- External dependency detection with risk scoring
- Solution distribution and shared component detection
- Complexity scoring and performance risk detection

**CI/CD-specific**

- Non-interactive authentication: client secret or workload identity federation (OIDC)
- Quality gates: fail the build on high-risk findings (`--fail-on`)
- Deterministic output, so documentation diffs are meaningful in pull requests
- JSON output suitable for archiving and future baseline comparison

## Architecture

```
solution-blueprint-ci/
├─ action.yml                                GitHub Action entry point
├─ packages/
│  ├─ core/        @aidevme/blueprint-core   Dataverse client, analysis engine, exporters
│  ├─ cli/         @aidevme/blueprint-cli    `blueprint` command
│  ├─ gh-action/                             Action source + bundled dist/ (node24)
│  └─ ado-task/                              task.json + vss-extension.json → .vsix
└─ docs/
```

All wrappers are thin: they translate inputs and credentials, then call `@aidevme/blueprint-core`. The core replaces PPTB Desktop's connection with a token-based Dataverse Web API client.

```
GitHub workflow ──► GitHub Action ──────┐
Azure Pipelines ──► Azure DevOps task ──┼──► blueprint-core ──► Dataverse Web API
Local / any CI  ──► CLI ────────────────┘    │
                                             └──► Markdown · HTML · JSON · ZIP
```

## Prerequisites

1. **An Entra ID app registration** (service principal).
2. **An application user** for that service principal in each Dataverse environment you document, created in the Power Platform admin center.
3. **A security role** for the application user with read access to metadata and solution components. Write access is never required.
4. **Node.js 22 or later** (for the CLI). The Azure DevOps task runs on the agent's Node.js 24 runner.

## Usage

Every run needs at least one solution, identified by its **unique name**, not its display name. Use `--solutions` with the CLI and the `solutions` input with the GitHub Action and the Azure DevOps task. Separate several unique names with commas.

### CLI

```bash
npx @aidevme/blueprint-cli generate \
  --env-url https://contoso.crm4.dynamics.com \
  --solutions ContosoCore,ContosoSales \
  --format md,html,json \
  --out ./docs/blueprint
```

Credentials are read from environment variables, never from arguments:

| Variable | Description |
|---|---|
| `AZURE_TENANT_ID` | Entra ID tenant ID |
| `AZURE_CLIENT_ID` | Application (client) ID of the service principal |
| `AZURE_CLIENT_SECRET` | Client secret (omit when using OIDC) |
| `AZURE_FEDERATED_TOKEN_FILE` | Path to an OIDC token (workload identity federation) |

**Options**

| Option | Description | Default |
|---|---|---|
| `--env-url` | Dataverse environment URL | required |
| `--solutions` | One solution unique name, or several separated by commas | required |
| `--publishers` | Comma-separated publisher prefixes | — |
| `--format` | `md`, `html`, `json`, `zip` (comma-separated) | `md` |
| `--out` | Output directory | `./blueprint` |
| `--fail-on` | Exit non-zero on findings: `high-risk`, `external-sync`, `deprecated` | — |
| `--include-system` | Include system tables | `false` |

### GitHub Actions

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  blueprint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: aidevme/solution-blueprint-ci@v1
        with:
          environment-url: https://contoso.crm4.dynamics.com
          tenant-id: ${{ vars.AZURE_TENANT_ID }}
          client-id: ${{ vars.AZURE_CLIENT_ID }}
          solutions: ContosoCore,ContosoSales
          formats: md,html
          output-dir: docs/blueprint

      - uses: actions/upload-artifact@v4
        with:
          name: solution-blueprint
          path: docs/blueprint
```

### Azure Pipelines

Install the extension in your organization, then use the existing **Power Platform** service connection (client secret or workload identity federation):

```yaml
steps:
  - task: SolutionBlueprint@1
    inputs:
      connection: 'PowerPlatform-Dev'
      solutions: 'ContosoCore,ContosoSales'
      formats: 'md,html,json'
      outputDir: '$(Build.ArtifactStagingDirectory)/blueprint'
      failOn: 'high-risk'

  - publish: '$(Build.ArtifactStagingDirectory)/blueprint'
    artifact: solution-blueprint
```

To keep the Azure DevOps Wiki current, commit the Markdown output to your code-wiki repository in a follow-up step.

## Installing from Azure Artifacts

Packages can be distributed through a private Azure Artifacts npm feed. Add a project-level `.npmrc`:

```ini
@aidevme:registry=https://pkgs.dev.azure.com/<org>/_packaging/<feed>/npm/registry/
always-auth=true
```

In Azure Pipelines, authenticate with `npmAuthenticate@0`. Outside Azure DevOps (for example in GitHub Actions), supply a personal access token with **Packaging (Read)** scope through a secret.

## Output

```
blueprint/
├─ README.md                  Summary and navigation
├─ erd.md                     Entity relationship diagram
├─ entities/<table>.md        Schema, forms, views, execution pipeline
├─ automation/                Plugins, flows, workflows, business rules
├─ analysis/                  Cross-entity chains, external dependencies, risks
├─ security/                  Roles, field security, masking rules
├─ blueprint.html             Self-contained interactive report
└─ blueprint.json             Full dataset
```

## Roadmap

- [ ] Headless core with Dataverse Web API client
- [ ] CLI with Markdown, HTML and JSON export
- [ ] GitHub Action (node24)
- [ ] Azure DevOps task with Power Platform service connection support
- [ ] Publishing pipeline to Azure Artifacts and the Visual Studio Marketplace
- [ ] Baseline comparison between runs (JSON diff with risk assessment)
- [ ] Pull request comments summarizing documentation changes

## Credits

This project builds on **[Power Platform Solution Blueprint (PPSB)](https://github.com/sabrish/power-platform-solution-blueprint)** by [SAB](https://github.com/sabrish), licensed under MIT. PPSB provides the discovery and analysis logic; this repository adds the headless runtime and CI/CD integrations. The original copyright notice is retained as required by the MIT license.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) to get started, and [DEVELOPER.md](DEVELOPER.md) to build and test locally.

## License

[MIT](LICENSE) © Zsolt Zombik / AIDevMe
