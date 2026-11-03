# Environment variables

The CLI reads credentials from environment variables, never from arguments.

| Variable | Description |
| --- | --- |
| `AZURE_TENANT_ID` | Entra ID tenant ID |
| `AZURE_CLIENT_ID` | Application (client) ID of the service principal |
| `AZURE_CLIENT_SECRET` | Client secret (omit when using OIDC) |
| `AZURE_FEDERATED_TOKEN_FILE` | Path to an OIDC token (workload identity federation) |

`AZURE_TENANT_ID` and `AZURE_CLIENT_ID` are always required, plus either `AZURE_CLIENT_SECRET` or
`AZURE_FEDERATED_TOKEN_FILE`. When both are set, the client secret is used. The token file is read again for each
token request, because the platform rotates it.
