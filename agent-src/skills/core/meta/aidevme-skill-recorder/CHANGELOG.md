# Changelog

<!-- cspell:ignore aidevme evals Evals Dataverse frontmatter cheatsheet marketingskills crawlability -->
<!-- markdownlint-configure-file { "MD024": { "siblings_only": true } } -->

All notable changes to the **aidevme-skill-recorder** skill: turning a demonstrated or described workflow into a reviewed SKILL.md. Newest first. Each entry says what changed and why it
matters to you; the commit has the detail. The source is `agent-src/skills/core/meta/aidevme-skill-recorder/`, synced to
`.claude/skills/` and `.github/skills/`.

## 2026-11-01

### Changed

- **Description points to `aidevme-skill-creator` with "see":** this clears the validator's warning about a
  missing related-skill reference.

## 2026-10-27

### Added

- **MIT license:** a `LICENSE` file, so the skill keeps its license when it's shared on its own.

## 2026-10-24

### Added

- **This changelog.** The skill's history in one file, from its commits and the Changelog table that
  `SKILL.md` used to have.

## 2026-10-22

### Added

- **The skill itself**, porting the aidevme/skill-recorder method: reconstruct one intent and ordered steps from
  narration, logs, screenshots or a Skill Recorder export, generalize them, map UI clicks to CLIs and APIs, and
  package the skill only after you approve it. (73fecd6)
- **References for the review:** [references/redaction-checklist.md](references/redaction-checklist.md) for
  secrets and personal data, [references/ui-to-api-mapping.md](references/ui-to-api-mapping.md) and
  [references/skill-template.md](references/skill-template.md). (73fecd6)
