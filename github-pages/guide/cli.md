# CLI

```bash
npx @aidevme/blueprint-cli generate \
  --env-url https://contoso.crm4.dynamics.com \
  --solutions ContosoCore,ContosoSales \
  --format md,html,json \
  --out ./docs/blueprint
```

Pass solutions by their **unique name**. Separate several unique names with commas.

Credentials are read from [environment variables](../reference/environment-variables.md), never from arguments.
All options are listed in [Options and inputs](../reference/options.md#cli).

## Installing from Azure Artifacts

Packages can be distributed through a private Azure Artifacts npm feed. Add a project-level `.npmrc`:

```ini
@aidevme:registry=https://pkgs.dev.azure.com/<org>/_packaging/<feed>/npm/registry/
always-auth=true
```

In Azure Pipelines, authenticate with `npmAuthenticate@0`. Outside Azure DevOps (for example in GitHub Actions),
supply a personal access token with **Packaging (Read)** scope through a secret.
