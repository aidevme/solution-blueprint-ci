# Changelog

<!-- cspell:ignore aidevme evals Evals Dataverse frontmatter cheatsheet marketingskills crawlability -->
<!-- markdownlint-configure-file { "MD024": { "siblings_only": true } } -->

All notable changes to the **skill-creator** skill: creating, improving and evaluating agent skills. Newest first. Each entry says what changed and why it
matters to you; the commit has the detail. The source is `agent-src/skills/core/delivery/skill-creator/`, synced to
`.claude/skills/` and `.github/skills/`.

## 2026-10-27

### Changed

- **License file renamed** from `LICENSE.txt` to `LICENSE`, like the other skills. It's still Anthropic's Apache
  2.0 license, unchanged.

## 2026-10-24

### Added

- **This changelog.** The skill's history in one file, from its commits. `SKILL.md` keeps its short Changelog
  table.

## 2026-10-22

### Added

- **The skill itself**, Anthropic's upstream skill-creator under the Apache 2.0 license (`LICENSE.txt`): draft a
  skill, run test cases with and without it, review the results in the eval viewer, and improve the skill and its
  description. **aidevme-skill-creator** wraps it with this repository's layout, scope and manifest rules.
  (42dc7be)
- **Grader, comparator and analyzer agents** in `agents/` for blind comparisons between skill versions, and
  scripts in `scripts/` to run evals, aggregate benchmarks, improve the description and package a skill.
  (42dc7be)
