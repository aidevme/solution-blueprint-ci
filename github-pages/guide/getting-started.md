# Getting started

**solution-blueprint-ci** is a headless documentation engine for Dataverse and Power Platform solutions. It's built
on the analysis engine of [Power Platform Solution Blueprint (PPSB)](https://github.com/sabrish/power-platform-solution-blueprint)
and packaged for pipelines:

- an **npm CLI** for any CI system or your local machine
- a **GitHub Action** for GitHub workflows
- an **Azure DevOps task** (pipeline extension) for Azure Pipelines

Each run connects to a Dataverse environment with a service principal, discovers the selected solutions, and exports
a complete blueprint as **Markdown** (ready for Azure DevOps Wiki), **HTML** (for stakeholders) and **JSON** (for
automation and baselines).

::: warning Early development
The commands, inputs and package names below describe the target design and may change before the first release.
:::

## Why

PPSB produces excellent blueprints, but it runs interactively inside PPTB Desktop. Documentation that depends on
someone remembering to click "Generate" goes stale. solution-blueprint-ci runs the same analysis on every build or
release, so your solution documentation is always current, versioned, and reviewable in pull requests.

## How it works

All wrappers are thin: they translate inputs and credentials, then call `@aidevme/blueprint-core`. The core replaces
PPTB Desktop's connection with a token-based Dataverse Web API client.

```text
GitHub workflow ──► GitHub Action ──────┐
Azure Pipelines ──► Azure DevOps task ──┼──► blueprint-core ──► Dataverse Web API
Local / any CI  ──► CLI ────────────────┘    │
                                             └──► Markdown · HTML · JSON · ZIP
```

## Next steps

1. Set up the [prerequisites](./prerequisites.md): a service principal and an application user.
2. Pick where it runs: the [CLI](./cli.md), [GitHub Actions](./github-action.md) or
   [Azure Pipelines](./azure-pipelines.md).
3. See what you get in [Output](./output.md).
