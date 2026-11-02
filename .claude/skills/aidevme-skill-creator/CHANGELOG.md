# Changelog

<!-- cspell:ignore aidevme evals Evals Dataverse frontmatter cheatsheet marketingskills crawlability -->
<!-- markdownlint-configure-file { "MD024": { "siblings_only": true } } -->

All notable changes to the **aidevme-skill-creator** skill: creating a new skill in this repository's single-source layout. Newest first. Each entry says what changed and why it
matters to you; the commit has the detail. The source is `agent-src/skills/core/meta/aidevme-skill-creator/`, synced to
`.claude/skills/` and `.github/skills/`.

## 2026-10-30

### Added

- **Agent Skills check in Step 6:** after the sync, run `agent-src/sync/validate-skills.sh` on `.claude/skills`.
  It fails when a skill's `name` doesn't match its folder, its description is missing or longer than 1,024
  characters, or `version` sits outside `metadata`, so a new skill meets the specification before it's committed.

## 2026-10-27

### Added

- **MIT license:** a `LICENSE` file, so the skill keeps its license when it's shared on its own.

## 2026-10-24

### Added

- **This changelog.** The skill's history in one file, from its commits and the Changelog table that
  `SKILL.md` used to have.

### Changed

- **Every skill gets a changelog.** New Step 5b: a new skill's `CHANGELOG.md` is created from the template by
  `sync.ps1` (or `agent-src/sync/check-changelogs.ps1 -Create`), and you rewrite its first entry; a change to an
  existing skill needs an entry under today's release. Step 6 now ends with `check-changelogs.ps1`, which must be
  clean.
- **No Changelog section in `SKILL.md`.** The history lives only in `CHANGELOG.md`; the critical rule that asked
  for a Changelog table in `SKILL.md` is replaced.

## 2026-10-22

### Changed

- **Breaking: renamed from `hso-skill-creator` to `aidevme-skill-creator`.** Invoke it by the new name. The
  references in `AGENTS.md`, the onboarding doc, sibling skills and the manifest were updated. (bfae6c2)

## 2026-09-10

### Added

- **The skill**, ported from HINT, with the required `core | project` scope choice, registration in
  `agent-src/sync/skills-manifest.json`, and the sync and parity check after every new skill. (Before this
  repository; no commit here.)
