# Changelog

<!-- cspell:ignore aidevme ForgeUSA evals Evals Dataverse frontmatter cheatsheet marketingskills crawlability -->
<!-- markdownlint-configure-file { "MD024": { "siblings_only": true } } -->

All notable changes to the **aidevme-shared-scripts** skill: the shared PowerShell library for Dataverse and Azure DevOps authentication, Web API calls and project config. Newest first. Each entry says what changed and why it
matters to you; the commit has the detail. The source is `agent-src/skills/core/foundation/aidevme-shared-scripts/`, synced to
`.claude/skills/` and `.github/skills/`.

## 2026-11-02

### Fixed

- **Dead references:** removed the notes pointing to ADRs and a review file that don't exist in this repo, so you no longer chase them.

## 2026-10-27

### Added

- **MIT license:** a `LICENSE` file, so the skill keeps its license when it's shared on its own.

## 2026-10-24

### Added

- **This changelog.** The skill's history in one file, from its commits and the Changelog table that
  `SKILL.md` used to have.

## 2026-10-22

### Changed

- **Breaking: renamed from `hso-shared-scripts` to `aidevme-shared-scripts`.** Dot-source the modules from the
  new folder. All consumer skills, the manifest and `Test-TemplatePrerequisites.ps1` were updated; older changelog
  rows in other skills keep the old name as history. (9bce740)

## 2026-09-11

### Added

- **The library**, ported from ForgeUSA and neutralized for the reusable template, as a foundation skill under the
  sync model. The governance modules were left for later. (Before this repository, by maciejnowicki; no commit here.)
