# Redaction checklist

Run against **every** input in Phase 1 and against the **draft** in Phase 5. Replace each hit with
a named `{{parameter}}`. Log the *kind* and *location* of each removal — never the value.

When in doubt, redact. A placeholder costs nothing; a leaked secret cannot be recalled.

## 1. Secrets (always remove; trigger the one-time warning)

| Kind | Patterns to look for | Replace with |
|---|---|---|
| Passwords | `password=`, `pwd=`, `-p <value>`, `--password`, `Password:` prompts echoed | `{{password}}` → prefer an auth flow that needs none |
| Bearer / access tokens | `Authorization: Bearer ey...`, JWTs (`eyJ` + two `.`-separated segments) | remove; describe the auth step |
| Client secrets | `--client-secret`, `client_secret=`, `ClientSecret=`, 30–40 char random strings next to an app ID | `{{clientSecret}}` (sourced from a vault / env var) |
| Personal access tokens | `--pat`, `AZURE_DEVOPS_EXT_PAT`, `ghp_`, `gho_`, `github_pat_`, base64 `:PAT` headers | `{{pat}}` (sourced from env var) |
| API / function keys | `x-functions-key`, `api-key`, `Ocp-Apim-Subscription-Key`, `?code=` on Azure Function URLs, `sig=` on SAS URLs | `{{apiKey}}` |
| Connection strings | `AuthType=...;Url=...;ClientSecret=...`, `AccountKey=`, `SharedAccessKey=`, `Server=...;Password=` | `{{connectionString}}` |
| Private keys / certs | `-----BEGIN ... PRIVATE KEY-----`, `.pfx` passwords, thumbprints paired with passwords | remove; reference a cert store |
| Cookies / session IDs | `Cookie:`, `Set-Cookie:`, `ReqClientId`, `.AspNet.` | remove |

## 2. Tenant & environment identifiers (remove; not a secret warning on its own)

| Kind | Patterns | Replace with |
|---|---|---|
| Tenant ID | GUID next to `tenant`, `tid`, `--tenant`, `login.microsoftonline.com/<guid>` | `{{tenantId}}` |
| Subscription / resource IDs | `/subscriptions/<guid>/resourceGroups/...` | `{{subscriptionId}}`, `{{resourceGroup}}` |
| App (client) IDs | GUID next to `appId`, `client_id`, `--application-id` | `{{clientId}}` |
| Environment URLs / org names | `https://<org>.crm*.dynamics.com`, `https://dev.azure.com/<org>`, `<org>.visualstudio.com`, `<site>.powerappsportals.com`, `<site>.sharepoint.com` | `{{environmentUrl}}`, `{{adoOrg}}`, `{{siteUrl}}` |
| Environment IDs | GUID in `make.powerapps.com/environments/<guid>`, `pac` env lists | `{{environmentId}}` |
| Pipeline / project / repo IDs | numeric `definitionId=`, project GUIDs, repo names that reveal the client | `{{pipelineId}}`, `{{project}}`, `{{repo}}` |

## 3. Customer & personal data (remove; use synthetic placeholders)

| Kind | Patterns | Replace with |
|---|---|---|
| Customer / company names | Names in URLs, solution names, publisher prefixes, repo names, window titles | `{{customer}}`, `{{solutionName}}`, `{{publisherPrefix}}` |
| People | Names, UPNs, emails, phone numbers, avatars in screenshots | `{{userUpn}}`, `{{email}}` |
| Record data | Field values in screenshots, query results, JSON payloads (accounts, contacts, cases, amounts) | describe the *shape* (columns, types) only |
| Record GUIDs | GUIDs in `id=`, `/api/data/.../<entityset>(<guid>)`, `etn=...&id=` | `{{recordId}}` |
| Local paths with usernames | `C:\Users\<name>\`, `/home/<name>/` | `<home>` / `{{workingFolder}}` |
| IP addresses / hostnames | Internal IPs, machine names | `{{host}}` |

## 4. Screenshots

- Treat every visible text element as evidence: title bars, address bars, tabs, breadcrumbs,
  grid rows, notification toasts, signed-in user badge.
- Extract only structure (screen name, field labels, button labels, step order). Do not
  transcribe record values or names.

## 5. Final check (Phase 5 and Verify)

Grep the generated package before showing the preview and again after saving:

```
eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.
ghp_|gho_|github_pat_
(?i)(password|pwd|secret|accountkey|sharedaccesskey|apikey|api-key)\s*[=:]
-----BEGIN [A-Z ]*PRIVATE KEY-----
[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}
https://[a-z0-9-]+\.crm[0-9]*\.dynamics\.com
[\w.+-]+@[\w-]+\.[\w.]+
```

Any hit that is not an intentional `{{placeholder}}` or a documented, generic example value
(e.g. a well-known Microsoft sample GUID in a doc link) must be removed before the preview is shown.
