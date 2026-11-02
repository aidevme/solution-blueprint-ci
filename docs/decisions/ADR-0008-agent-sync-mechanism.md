---
adr: 0008
title: Agent single-source → dual-tool sync mechanism
status: accepted
date: 2026-09-10
author: maciejnowicki
supersedes: []
---

# ADR-0008 — Agent single-source → dual-tool sync mechanism

## Context

The agent layer must serve **both** Claude Code (`.claude/`) and GitHub Copilot (`.github/`) from one
authored source, with no hand-maintained mirror. Keeping **two** hand-edited skill mirrors and two
hand-edited instruction files creates drift that then has to be policed, and it invites bugs such as
double-nested skill folders and stray `.zip` artifacts. Supporting only one assistant avoids the drift
but leaves the other with no path at all. We need both tools without the drift surface.

## Options considered

1. **Commit two mirrors, reconcile with a skill.** Pros: tools read their native dirs
   directly. Cons: perpetual drift; two instruction files; the bugs described above.
2. **Symlink/junction one dir to the other.** Pros: no copy. Cons: fragile on Windows/CI, git treats
   symlinks poorly, Copilot/Claude discovery expects real files.
3. **Single committed source + generated outputs, with a parity gate (chosen).** Author skills once
   under `agent-src/skills/{core,project}` and instructions once in `AGENTS.md`; **generate**
   `.claude/skills`, `.github/skills`, `CLAUDE.md`, and `copilot-instructions.md`; verify byte-parity
   in CI/pre-commit. Pros: drift **cannot land** (one source; outputs regenerated + verified). Cons: a
   sync step must run after any source edit — enforced by the parity gate.

## Decision

Adopt option 3 — **the source is committed; `.claude`/`.github` and the two instruction files are
build outputs.**

- `agent-src/sync/sync.ps1` — fans the physical skills under `agent-src/skills/**` into both tool
  dirs (clean-then-copy into a fresh dest dir, so double-nesting is impossible; `.zip` pruned), and
  generates `CLAUDE.md` / `copilot-instructions.md` = tool preamble (`agent-src/sync/preambles/*.md`)
  + the `AGENTS.md` body. `-DryRun` and `-Target Claude|Copilot|Both`.
- `agent-src/sync/skills-manifest.json` — the registry: every skill's `scope` (core | project | drop),
  group, `ported` flag, and source repo. Core round-trips to `shared/`; project never does.
- `agent-src/sync/verify-parity.ps1` — the hard gate: MD5 every generated file against source; check
  skill-set parity (no orphan / none missing), cross-tool byte-identity, that each instruction file
  ends with the `AGENTS.md` body, and hygiene (no stray `.zip`, no `<name>/<name>/`). **Exit 1 on any
  drift.** Runs in CI and pre-commit.
- `agent-src/sync/check-shared.ps1` — fail-fast guard for the inherited `shared/` product tier
  (`-Strict` → exit 3 when absent).

**Generated outputs are committed** (so a fresh clone works with no build step for either tool) and
their integrity is guaranteed by the `verify-parity` gate rather than by trust. A source edit that is
not followed by a sync fails the gate before it can be committed.

## Rationale

- **Drift is designed out, not policed.** With one source and a verified regeneration, the twin-mirror
  drift class and the double-nesting/stray-zip bugs cannot recur — demonstrated by a negative test
  (inject hand-edit + `.zip` → parity exit 1; re-sync → exit 0).
- **One instruction source** removes the other drift surface (two near-duplicate CLAUDE.md /
  copilot files).
- **The core/project split is first-class** (manifest `scope`), and only core round-trips upstream.
- **Reusability:** the mechanism is customer-neutral.

## Consequences

- Skills and instructions are edited ONLY under `agent-src/` / `AGENTS.md`; editing a generated file
  is a defect the gate catches.
- CI/pre-commit must run `verify-parity.ps1`; a non-zero exit blocks the commit.
- New skills are created via `aidevme-skill-creator` with a required `--scope`, registered in the
  manifest, then synced.
- A repo that uses the `shared/` product tier must gitignore `Worklog/`, `.worktrees/`, and `shared/`
  (the junction), and provide the junction (guarded by `check-shared.ps1 -Strict`). This repo has no
  `shared/` tier.
