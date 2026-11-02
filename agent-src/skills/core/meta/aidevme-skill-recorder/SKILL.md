---
name: aidevme-skill-recorder
layer: meta
scope: core
description: |
  Turn a demonstrated or described workflow into a reviewed, production-quality SKILL.md:
  reconstruct one intent plus ordered steps from the evidence, generalise it, map UI clicks to
  native CLIs/APIs, redact secrets, and package the skill only after explicit approval.
  Use when:
  (1) "record this as a skill", "turn what I just did into a skill", "make a skill from what we just did"
  (2) "make a skill from these steps / this log / these commands / these screenshots"
  (3) "convert this Skill Recorder session into a Claude skill" (intent + steps export)
  (4) /aidevme-skill-recorder
  Accepts narration, pasted terminal output, screenshots, URL/window-title timelines, Skill
  Recorder exports, or the current conversation.
  Does NOT: run or replay the recorded task; edit an existing skill's logic (edit it directly);
  register/sync skills into this template (see aidevme-skill-creator); build Power Automate
  flows or scheduled jobs (it only describes them).
allowed-tools: Read, Grep, Glob, Write, Edit
argument-hint: "[path to evidence | 'this conversation']"
---

# aidevme-skill-recorder

Ports the method of the Skill Recorder app (record once → reconstruct intent + ordered steps →
human review → generate a reusable SKILL.md) into a skill. Five principles drive every phase:

1. **Intent first, then ordered steps** — reconstructed from what the user actually did.
2. **Generalise from one example** — one form submitted → the procedure for all of them.
3. **Native tools over UI replay** — `pac`, Dataverse Web API, `az`, `gh`, MCP connectors before clicks.
4. **Human review gate** — the full SKILL.md is shown read-only before anything is saved.
5. **Secrets hygiene** — nothing sensitive from the evidence ever reaches the skill.

## Inputs

Accept any combination. Read each as-is; do not assume a format.

| Input | What to extract |
|---|---|
| Free-text walkthrough / narration transcript | Goal statements, step order, decisions, "then I…" |
| Pasted terminal commands + output | Exact commands, flags, success/failure signals |
| Screenshots / image sequence | Screen titles, forms, fields touched, buttons pressed, results shown |
| URL / window-title timeline | System per step, navigation order, record/entity types from URL paths |
| Skill Recorder intent + steps export | Intent and step list — if the structure is unclear, ask what each part means |
| The current conversation | Tool calls made, commands run, files edited, corrections the user made |

## Procedure

Run the phases in order. Phases 2 and 6 are hard gates: do not pass them without explicit approval.

### Phase 1 — Intake & redact

1. Collect all evidence. If the user said "what we just did", use this conversation's tool calls
   and outcomes.
2. Scan every input against [references/redaction-checklist.md](references/redaction-checklist.md).
3. Replace each hit with a named parameter (`{{environmentUrl}}`, `{{tenantId}}`, `{{recordId}}`).
   Keep a redaction log: *what kind* of value, *where* it appeared, *which parameter* replaced it
   — never the value itself.
4. If any secret (password, token, key, connection string) was found, warn **once**:
   > Secrets were found in the evidence and removed. Consider rotating them if this evidence was
   > shared or stored.
5. **Thin-evidence check.** If the step order cannot be reconstructed reliably (gaps between
   screens, unexplained jumps, output without the commands that produced it), stop. Say what is
   missing and ask for it. Do not guess.

### Phase 2 — Reconstruct the analysis (GATE)

Produce and present the **analysis**:

```markdown
## Analysis: <working name>

**Intent:** <one sentence — the goal, not the clicks>

**Steps**
| # | Action | Target system | Inputs | Expected result |
|---|---|---|---|---|
| 1 | ... | ... | ... | ... |

**Variables (become parameters)**
| Name | Example (redacted) | Source |
|---|---|---|

**Preconditions**
- Auth: ...
- Licences / roles: ...
- Environment: ...
- Tools: ...

**Redaction log:** <n> items removed — <kinds>.
```

Rules:
- The intent names the outcome ("Register a new plugin step for an entity message"), not the
  mechanics ("Click Register New Step").
- Collapse noise (mis-clicks, retries, scrolling) — keep only steps that changed state or read
  something used later.
- Mark any step whose purpose is unclear with `(?)` rather than inventing a reason.

Ask the user to **approve or edit** the analysis. Do not write the skill before approval. Each
edit produces a revised analysis; re-present it.

### Phase 3 — Generalise

From the approved analysis, determine:
- **Batch form** — what the loop is (one record → N records; one env → each env; one file → a folder).
- **Edge cases** — empty input, already-exists, partial failure mid-batch, permission denied.
- **Failure points** — the steps most likely to break (auth expiry, throttling, locked records).
- **Verification checks** — the observable proof each step and the whole task succeeded.

Ask **at most 3** clarifying questions, only where the answer changes the skill. Pick sensible
defaults for the rest and state them.

### Phase 4 — Tool mapping

For every UI step, propose the native equivalent using
[references/ui-to-api-mapping.md](references/ui-to-api-mapping.md). Present as:

| # | Recorded UI step | Native equivalent | Notes |
|---|---|---|---|

- Prefer: MCP connector available in the session → official CLI (`pac`, `az`, `gh`) → REST / Web
  API → SDK → UI.
- Keep a UI step only when no API exists. Flag it **FRAGILE** with the reason (selector drift,
  no API surface, licence-gated UI) and add a manual-fallback note.
- Never assume platform metadata: generated steps that need field names, option values or IDs
  must query them live (e.g. `EntityDefinitions` metadata) instead of hardcoding the example's values.

### Phase 5 — Draft SKILL.md

Draft from [references/skill-template.md](references/skill-template.md). Requirements:

- **Folder / `name`:** kebab-case, describes the task, contains neither "claude" nor "anthropic".
- **`description`:** trigger-rich — what it does, an explicit *Use when* list with phrases a user
  would actually say, and a *Does NOT* clause naming near-miss tasks.
- **Body:** Purpose · Prerequisites · Parameters · numbered Procedure · Verify · Error handling ·
  Worked example (with placeholder values only).
- **Style:** imperative, concise, no marketing language.
- **Destructive / irreversible steps** (delete, deactivate, publish/import to prod, send email or
  Teams message, merge, force-push, purge): insert an explicit confirmation step *inside* the
  generated procedure, immediately before the action, that shows what will change and waits for "yes".
- **Environment safety:** generated steps that write to a platform must first print and confirm
  the target environment/org/repo.
- **Placement:** keep SKILL.md focused; move long reference tables to `references/`, and reusable
  command sequences to `scripts/` (parameterised, no embedded secrets).
- **Verify section is mandatory** and must prove the outcome (query the created record, read the
  pipeline run status, `gh pr view`), not merely that commands exited 0.
- Re-run the redaction checklist against the draft before showing it.

### Phase 6 — Review gate (GATE)

1. Show the **complete** SKILL.md, frontmatter included, in one fenced block, plus a list of any
   `references/` or `scripts/` files and their contents. Label it *read-only preview*.
2. Ask: **Approve and save / Edit the plan / Cancel.**
3. If the user edits the analysis, steps, parameters or mapping, the preview is **invalid**:
   regenerate it from the updated plan and show it again. Never patch a stale preview.
4. Only on explicit approval, write the package:
   ```
   <skill-name>/
   ├── SKILL.md
   ├── references/   (only if used)
   └── scripts/      (only if used)
   ```
   Location: the path the user names. If none, ask. In a template-derived repo, offer to hand off
   to **aidevme-skill-creator** to place it under `agent-src/skills/<scope>/…`, register it in the
   manifest, and sync — do not write into generated `.claude/skills` / `.github/skills` directly.

### Phase 7 — Optional automation

If the task is recurring, offer (as a separate step, after saving) to describe it as a scheduled task:

| Field | Value |
|---|---|
| Cadence | e.g. weekdays 07:00 local |
| Inputs | parameters + where each comes from at run time |
| Output | artifact / record / report produced |
| Notification | who is told, via which channel, on success and on failure |
| Runner | Azure DevOps scheduled pipeline, Power Automate recurrence, cloud agent routine |

Describe only. Do not create the schedule unless the user asks in a separate request.

### Phase 8 — Optional evals

Offer 3–5 trigger test prompts for the new skill — at least 2 should-trigger and 1–2
should-not-trigger (near misses that a sibling skill should handle). Format:

```json
[
  { "query": "realistic user prompt", "should_trigger": true },
  { "query": "near-miss prompt", "should_trigger": false }
]
```

Save as `evals/trigger-evals.json` in the skill folder if the user accepts.

## Verify

Before reporting done, confirm all of the following and state the result of each:

- [ ] The saved SKILL.md is byte-identical to the last approved preview.
- [ ] Frontmatter parses; `name` equals the folder name; kebab-case; no "claude"/"anthropic".
- [ ] `description` has a *Use when* list and a *Does NOT* clause.
- [ ] The body has a **Verify** section that checks the outcome, not just exit codes.
- [ ] Every destructive step is preceded by an in-procedure confirmation.
- [ ] A final grep of the package for the redaction-checklist patterns returns no hits.
- [ ] Every file linked from SKILL.md exists in the package.

## Error handling

| Situation | Action |
|---|---|
| Evidence too thin / step order ambiguous | Stop; list the gaps; ask for more evidence |
| Skill Recorder export structure unclear | Show what you parsed; ask which part is intent vs steps |
| User rejects the analysis repeatedly | Ask them to narrate the task once in their own words; restart Phase 2 |
| No API exists for a step | Keep the UI step, flag FRAGILE, add a manual fallback |
| Evidence contains customer record data | Redact; use synthetic placeholders in the worked example |
| Target folder already contains a skill of that name | Show the diff; ask before overwriting |

## Worked example (abbreviated)

**Evidence:** user pastes a shell history:
```
pac auth create --url https://contoso-dev.crm4.dynamics.com --tenant 72f9...  # (redacted below)
pac solution export --name CoreCustomisations --path ./out --managed false
pac solution unpack --zipfile ./out/CoreCustomisations.zip --folder ./src/CoreCustomisations
git add src && git commit -m "Export CoreCustomisations"
```

**Redaction log:** environment URL → `{{environmentUrl}}`; tenant ID → `{{tenantId}}`.
(Customer-identifying hostname removed.)

**Analysis intent:** Export an unmanaged Dataverse solution from Dev, unpack it to source, and
commit it.

**Generalise:** batch form = each solution in a list; edge case = solution not found; verify =
`git log -1 --stat` shows changes under `src/{{solutionName}}`.

**Tool mapping:** already native (`pac`); no FRAGILE steps.

**Draft:** skill `export-unpack-commit-solution` with parameters `environmentUrl`, `solutionName`,
`outputFolder`; procedure confirms the active `pac auth` profile targets Dev before export;
the commit step is shown and confirmed before running.
