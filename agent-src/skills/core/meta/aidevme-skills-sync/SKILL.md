---
name: aidevme-skills-sync
layer: governance
scope: core
description: |
  Verification backstop for the single-source → dual-tool sync. Confirms the GENERATED tool
  directories (.claude/skills, .github/skills) and the generated instruction files (CLAUDE.md,
  .github/copilot-instructions.md) exactly reflect the committed SOURCE (agent-src/skills/**,
  AGENTS.md). Reports orphans, drift, cross-tool mismatch, stray artifacts, and double-nesting. Also
  checks that every skill has a CHANGELOG.md and that every changed skill has a changelog entry,
  creating a missing changelog from the template.

  Use when:
  (1) User says "sync skills", "check skill parity", "are the skills in sync?"
  (2) After editing a skill under agent-src/skills/** — verify the outputs were regenerated
  (3) After adding/removing a skill — confirm the manifest and both tool dirs agree
  (4) Before committing / in CI — parity and changelogs must be clean
  (5) "check the changelogs", "does every skill have a CHANGELOG.md?"

  Does NOT hand-edit the generated mirrors: the fix for any drift is to re-run sync.ps1.
---

# aidevme-skills-sync

This template **inverts** the old twin-mirror model. There is exactly one source of truth:

- `agent-src/skills/{core,project}/**` — committed skill source
- `AGENTS.md` — committed instruction source

`.claude/skills/`, `.github/skills/`, `CLAUDE.md`, and `.github/copilot-instructions.md` are
**build outputs** of `agent-src/sync/sync.ps1`. Because there is only one source, the classic drift
(edit one mirror, forget the other) and the double-nesting bug (`<name>/<name>/`) **cannot originate
here** — they can only appear if someone hand-edited a generated file or ran a bad copy. This skill
detects exactly that.

## Workflow

### 1. Run the parity check

```powershell
pwsh -File agent-src/sync/verify-parity.ps1
```

It checks, and **exits non-zero on any problem**:

| Check | Meaning |
|---|---|
| Skill-set parity | `.claude/skills` and `.github/skills` contain exactly the ported source skills — no orphan, none missing |
| Content parity | every file under each generated skill matches its source (MD5) |
| Cross-tool parity | `.claude/skills` and `.github/skills` are byte-identical to each other |
| Instruction parity | `CLAUDE.md` and `copilot-instructions.md` each end with the `AGENTS.md` body |
| Hygiene | no stray `*.zip` in a generated skill; no double-nested `<name>/<name>/` |

### 2. Check the changelogs

```powershell
pwsh -File agent-src/sync/check-changelogs.ps1 -Create          # before a commit
pwsh -File agent-src/sync/check-changelogs.ps1 -Base origin/dev # also count commits not yet pushed
```

It exits non-zero on any problem. `sync.ps1` runs it with `-Create` too, as a warning only.

| Result | Meaning | Fix |
|---|---|---|
| `CREATED` | The skill had no `CHANGELOG.md`; one was written from `.templates/CHANGELOG_STYLE.md` | **New skill:** rewrite the "The skill itself" entry to say what the skill does and add an Evals entry. **Existing skill:** backfill its history from `git log -- <skill folder>` (style guide, "Adding a changelog to an existing unit") |
| `MISSING` | No `CHANGELOG.md` (run without `-Create`) | Re-run with `-Create`, then as above |
| `NO ENTRY` | Files in the skill changed but `CHANGELOG.md` didn't | Add an entry under today's release in the right category, saying what changed for the user |
| `NO RELEASE` | `CHANGELOG.md` changed but has no `## <today>` release | Put the new entries under a `## YYYY-MM-DD` heading for today, at the top |
| `TABLE` | `SKILL.md` still has a `## Changelog` section | Check each row is covered in `CHANGELOG.md`, then remove the section: `CHANGELOG.md` is the only history |

Write the entries yourself from the diff (`git diff -- <skill folder>`); the script only finds what's missing.
Then re-run `sync.ps1`, so the copies in `.claude/` and `.github/` get the changelog.

### 3. Validate the skills

```powershell
$env:SKILLS_DIR = '.claude/skills'; bash agent-src/sync/validate-skills.sh
```

Run it whenever a skill is created or updated. It checks every synced skill against the Agent Skills
specification and exits non-zero on any error:

| Check | Error or warning |
|---|---|
| `SKILL.md` exists and starts with closed YAML frontmatter | Error |
| `name` matches the folder: 1–64 characters, lowercase letters, digits and single hyphens | Error |
| `description` is present and at most 1,024 characters (block descriptions, `description: \|`, included) | Error |
| `version` sits under `metadata:`, not at the top level | Error |
| `description` says when to use the skill and names related skills | Warning |
| `license` is MIT, Apache-2.0 or ISC | Warning |
| `SKILL.md` is under 500 lines | Warning |

Fix errors in the source (`agent-src/`), then sync and run it again. The script is a copy of
`aidevme/marketingskills`'s `validate-skills.sh`, patched to read block descriptions; its header has the details.
The **Skills check** agentic workflow (`.github/workflows/skills-validation.md`) also runs it every Monday and on
demand, and reports the findings as a `[Skills check]` issue.

### 4. If everything is clean

Report "PARITY OK — zero drift", "Changelog check: OK" and "All skills are valid!". Nothing to do.

### 5. If parity FAILS

The generated outputs are stale or were hand-edited. **Do not patch the mirrors.** Regenerate:

```powershell
pwsh -File agent-src/sync/sync.ps1            # regenerate both tools from source
pwsh -File agent-src/sync/verify-parity.ps1   # confirm clean
```

If a real intended change is missing, it belongs in the **source** (`agent-src/skills/**` or
`AGENTS.md`) — make it there, then sync. If a manifest/filesystem discrepancy is reported (a skill
on disk with no `ported=true` entry, a scope mismatch, or a `ported=true` entry with no folder),
fix `agent-src/sync/skills-manifest.json` or the folder location, then sync.

## Rules

- The **source** (`agent-src/`) is the only place a skill is edited. Full stop.
- Never resolve drift by editing `.claude/` or `.github/` — that re-creates the very problem this
  model removes.
- CI and pre-commit run `verify-parity.ps1`; a non-zero exit blocks the commit. Run `check-changelogs.ps1` with
  it: a skill change without a changelog entry isn't done.
