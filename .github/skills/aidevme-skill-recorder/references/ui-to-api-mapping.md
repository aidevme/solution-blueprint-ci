# UI → CLI / API mapping

Use in Phase 4 to replace recorded UI steps with native equivalents. Preference order:
**MCP connector in session → official CLI → REST / Web API → SDK → UI (flag FRAGILE)**.

Commands are starting points. Confirm exact flags with `--help` / the docs for the installed
version before putting them in a generated skill; never assume field names or option values —
query metadata live.

Placeholders: `{{env}}` = Dataverse environment URL, `{{org}}` / `{{project}}` = Azure DevOps,
`{{owner}}/{{repo}}` = GitHub.

## Power Platform / Dataverse

| UI action (maker portal / admin center) | Native equivalent |
|---|---|
| Sign in / pick environment | `pac auth create --environment {{env}}`; `pac auth list`; `pac env who` |
| List environments | `pac env list`; Power Platform admin API |
| Export solution | `pac solution export --name {{solutionName}} --path {{out}} [--managed]` |
| Unpack solution to source | `pac solution unpack --zipfile {{zip}} --folder {{src}}` |
| Import solution | `pac solution import --path {{zip}}` (**destructive on target — confirm env; Dev only**) |
| Publish all customisations | `pac solution publish`; Web API `PublishAllXml` action |
| Check solution | `pac solution check` |
| Create / update table, column, relationship | Web API `POST {{env}}/api/data/v9.2/EntityDefinitions`, `.../Attributes`, `RelationshipDefinitions` |
| Look up table / column metadata | `GET .../EntityDefinitions(LogicalName='{{table}}')?$expand=Attributes`; Dataverse MCP `describe_table` |
| Create / edit / delete records | Web API `POST/PATCH/DELETE {{env}}/api/data/v9.2/{{entitySet}}`; `$batch` for bulk (**delete: confirm**) |
| Advanced Find / view query | Web API `$filter`/`$select`, or `?fetchXml=` |
| Import data from Excel/CSV | `pac data` / Configuration Migration tool; Web API `$batch` upsert with alternate keys |
| Register plugin assembly / step | `pac plugin push`; Plugin Registration Tool CLI; Web API `sdkmessageprocessingsteps` |
| Push PCF control | `pac pcf push --publisher-prefix {{prefix}}` |
| Upload web resource | Web API `PATCH webresourceset({{id}})` + `PublishXml` |
| Turn flow on / off | Power Automate MCP / `pac` flow commands where available; Web API `workflows` `statecode` |
| Get flow run history | Power Automate MCP `get_run_history`; Flow management API |
| Assign security role | Web API `POST systemusers({{id}})/systemuserroles_association/$ref` |
| Create environment variable value | Web API `environmentvariablevalues` |
| Copilot Studio: export / import agent | Copilot Studio agents are solution components — `pac solution export/import`; `pac copilot` commands where available |
| Copilot Studio: test conversation | **FRAGILE (UI)** test canvas; prefer Direct Line API for scripted tests |
| Canvas app: edit screens | `pac canvas download/unpack` → edit `.pa.yaml` → `pac canvas pack` |
| Power Pages: upload site | `pac pages upload --path {{sitePath}}` / `pac pages download` |
| Form / view designer layout | Web API `systemforms` / `savedqueries` (formxml / layoutxml); otherwise **FRAGILE (UI)** |

## Dynamics 365 CE (model-driven app)

| UI action | Native equivalent |
|---|---|
| Open record, change field, save | Web API `PATCH {{entitySet}}({{id}})` |
| Run on-demand workflow / action | Web API `POST {{entitySet}}({{id}})/Microsoft.Dynamics.CRM.{{action}}`; `ExecuteWorkflow` |
| Resolve / close case | Web API `CloseIncident` action (**confirm**) |
| Qualify lead | Web API `QualifyLead` action |
| Assign record | Web API `PATCH` `ownerid@odata.bind` |
| Bulk edit selected rows | Web API `$batch` of `PATCH` |
| Run report / export to Excel | Web API query + local export; **FRAGILE (UI)** for SSRS rendering |
| Audit history | Web API `audits`, `RetrieveRecordChangeHistory` |

## Azure DevOps

| UI action | Native equivalent |
|---|---|
| Create / update work item | `az boards work-item create/update`; REST `_apis/wit/workitems` |
| Query work items | `az boards query --wiql "..."` |
| Create pull request | `az repos pr create`; REST `_apis/git/repositories/{{repo}}/pullrequests` (UTF-8 bodies) |
| Approve / complete PR | `az repos pr set-vote`, `az repos pr update --status completed` (**merge: confirm**) |
| Queue pipeline run | `az pipelines run --id {{pipelineId}} --branch {{branch}}` |
| Check pipeline run result | `az pipelines runs show --id {{runId}}` |
| Approve release stage | REST `_apis/pipelines/approvals` (**prod: confirm; human only per env policy**) |
| Manage variable group | `az pipelines variable-group variable update` (**never write secret values into the skill**) |
| Create branch | `git` + `az repos ref create` |
| Wiki page edit | `az devops wiki page update` |

## GitHub

| UI action | Native equivalent |
|---|---|
| Create issue / comment | `gh issue create`, `gh issue comment` |
| Create PR | `gh pr create --base {{base}} --head {{head}}` |
| Review / merge PR | `gh pr review`, `gh pr merge` (**confirm**) |
| Re-run workflow | `gh run rerun {{runId}}`; `gh workflow run {{workflow}}` |
| Check run status | `gh run view {{runId}} --json status,conclusion` |
| Create release | `gh release create {{tag}}` (**publishes — confirm**) |
| Edit repo settings / secrets | `gh api`; `gh secret set` (value from env, never in skill) |
| Read a page / file | `gh api repos/{{owner}}/{{repo}}/contents/{{path}}`; web fetch for public pages |

## Azure

| UI action (portal) | Native equivalent |
|---|---|
| Select subscription | `az account set --subscription {{subscriptionId}}` |
| Create / update resource | `az <service> create/update`; Bicep `az deployment group create` |
| Delete resource | `az <service> delete` (**confirm; show resource ID first**) |
| App registration / secret | `az ad app create`, `az ad app credential reset` (**secret output never stored in skill**) |
| Read Key Vault secret | `az keyvault secret show` at run time only |
| Restart web app / function | `az webapp restart`, `az functionapp restart` |
| Read logs | `az monitor log-analytics query`; App Insights `az monitor app-insights query` |

## Microsoft 365 (when the recorded task touches it)

| UI action | Native equivalent |
|---|---|
| Send email / Teams message | Microsoft Graph `sendMail`, `chatMessage` (**always confirm recipients and content**) |
| Upload to SharePoint / OneDrive | Graph `PUT /drives/{{driveId}}/root:/{{path}}:/content` |

## Keep as UI only when

- No API surface exists for the action, or it is licence/preview gated in UI only.
- The action is a visual verification a human must perform.

Then: mark **FRAGILE (UI only)**, give the reason, describe the screen by stable labels (not
coordinates), and add a manual fallback.
