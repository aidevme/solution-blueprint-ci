# Options and inputs

Solutions are always identified by their **unique name**, not their display name. Lists are separated by commas.

## CLI

`blueprint generate --env-url <url> --solutions <names> [options]`

| Option | Description | Default |
| --- | --- | --- |
| `--env-url` | Dataverse environment URL | required |
| `--solutions` | One solution unique name, or several separated by commas | required |
| `--publishers` | Comma-separated publisher prefixes | — |
| `--format` | `md`, `html`, `json`, `zip` (comma-separated) | `md` |
| `--out` | Output directory | `./blueprint` |
| `--fail-on` | Exit non-zero on findings: `high-risk`, `external-sync`, `deprecated` | — |
| `--include-system` | Include system tables | `false` |
| `-h`, `--help` | Show the help | — |

## GitHub Action

| Input | Description | Default |
| --- | --- | --- |
| `environment-url` | Dataverse environment URL | required |
| `tenant-id` | Entra ID tenant ID | required |
| `client-id` | Application (client) ID of the service principal | required |
| `client-secret` | Client secret; omit when using OIDC | — |
| `solutions` | One solution unique name, or several separated by commas | required |
| `formats` | `md`, `html`, `json`, `zip` (comma-separated) | `md` |
| `output-dir` | Output directory | `./blueprint` |
| `fail-on` | Fail on findings: `high-risk`, `external-sync`, `deprecated` | — |

## Azure DevOps task

| Input | Description | Default |
| --- | --- | --- |
| `connection` | Power Platform service connection | required |
| `solutions` | One solution unique name, or several separated by commas | required |
| `formats` | `md`, `html`, `json`, `zip` (comma-separated) | `md` |
| `outputDir` | Output directory | `./blueprint` |
| `failOn` | Fail on findings: `high-risk`, `external-sync`, `deprecated` | — |
