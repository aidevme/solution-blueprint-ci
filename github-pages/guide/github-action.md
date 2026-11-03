# GitHub Actions

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

Without `client-secret`, the action uses workload identity federation (OIDC), which needs the `id-token: write`
permission. All inputs are listed in [Options and inputs](../reference/options.md#github-action).
