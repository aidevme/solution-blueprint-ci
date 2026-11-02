# Generated skill template

The skeleton every skill produced by `aidevme-skill-recorder` follows. Replace every `<...>`;
delete any optional section that does not apply. Keep the result under ~400 lines and move long
tables or command sequences to `references/` and `scripts/`.

Rules that apply to the whole file:
- Imperative voice, concise, no marketing language.
- Only `{{parameter}}` placeholders for anything that varies or is sensitive — never values from
  the evidence.
- Every write step targets a confirmed environment; every destructive step has its own
  confirmation step immediately before it.

---

```markdown
---
name: <kebab-case-task-name>
description: |
  <One sentence: what the skill accomplishes, stated as the outcome.>
  Use when:
  (1) "<phrase a user would actually say>"
  (2) "<another phrase>"
  (3) <a situation, e.g. "after a sprint closes and the release notes need regenerating">
  Does NOT: <near-miss task 1 (and which skill/tool handles it)>; <near-miss task 2>.
---

# <Human-readable title>

## Purpose

<Two to four sentences: the intent, the batch form (one / many), and the outcome the user gets.>

## Prerequisites

- **Auth:** <e.g. `pac auth` profile for {{environmentUrl}}; `az login` to {{tenantId}}; `gh auth status` OK>
- **Roles / licences:** <e.g. System Customizer in the target environment>
- **Tools:** <e.g. pac CLI ≥ 1.30, az CLI, gh, PowerShell 7>
- **Environment:** <e.g. writes go to Dev only>

## Parameters

| Name | Required | Description | Example |
|---|---|---|---|
| `{{environmentUrl}}` | yes | Target Dataverse environment URL | `https://<org>.crm.dynamics.com` |
| `{{<name>}}` | <yes/no> | <...> | <synthetic example> |

If a required parameter is missing, ask for it. Never guess.

## Procedure

1. **Confirm target.** Print the active connection (`pac auth list` / `az account show` /
   `gh repo view`) and confirm it matches `{{environmentUrl}}`. Stop if it does not.
2. **<Step title>.** <Imperative instruction.>
   ```<shell>
   <native command using {{parameters}}>
   ```
   Expected: <observable result>.
3. **<Step title>.** <...>
4. **Confirm before <destructive action>.** Show exactly what will change (<records / files /
   recipients / environment>) and wait for an explicit "yes". Stop on anything else.
5. **<Destructive action>.** <...>

<For a batch: state the loop explicitly — "Repeat steps 2–5 for each item in {{items}}; collect
failures and continue; report them at the end.">

<For any step kept as UI: prefix with **FRAGILE (UI only):** and give the reason plus a manual
fallback.>

## Verify

Prove the outcome, not just exit codes:

- <e.g. Query the created record: `GET {{environmentUrl}}/api/data/v9.2/<entityset>?$filter=...` returns 1 row>
- <e.g. `gh pr view {{prNumber}} --json state` shows `OPEN`>
- <e.g. Pipeline run `{{runId}}` result is `succeeded`>

Report each check as pass/fail.

## Error handling

| Symptom | Likely cause | Action |
|---|---|---|
| 401 / 403 | Expired auth or missing role | Re-auth; check role; do not retry blindly |
| 429 / throttling | Service protection limits | Back off per `Retry-After`; resume the batch |
| Already exists | Re-run / duplicate | Skip and report, or update if the procedure says so |
| <task-specific> | <...> | <...> |

## Worked example

<Short end-to-end run with synthetic placeholder values only — no real names, URLs, IDs or record
data. Show input parameters, the commands as they would be run, and the Verify output.>
```
