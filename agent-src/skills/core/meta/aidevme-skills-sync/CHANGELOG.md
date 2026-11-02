# Changelog

<!-- cspell:ignore aidevme evals Evals Dataverse frontmatter cheatsheet marketingskills crawlability -->
<!-- markdownlint-configure-file { "MD024": { "siblings_only": true } } -->

All notable changes to the **aidevme-skills-sync** skill: checking that the generated skill folders and instruction files match their source. Newest first. Each entry says what changed and why it
matters to you; the commit has the detail. The source is `agent-src/skills/core/meta/aidevme-skills-sync/`, synced to
`.claude/skills/` and `.github/skills/`.

## 2026-11-01

### Changed

- **Shorter description:** cut to the 1,024-character limit of the Agent Skills specification, with every trigger
  phrase kept.

## 2026-10-30

### Added

- **Step 3, validate the skills:** `agent-src/sync/validate-skills.sh` checks every synced skill against the Agent
  Skills specification after a skill is created or updated. A table lists each check and whether it's an error
  or a warning. The script is a copy of `aidevme/marketingskills`'s, patched to read `description: |` blocks, so
  long descriptions are caught. The clean-run report and the parity-failure steps are now steps 4 and 5.
- **Weekly skills check:** the **Skills check** agentic workflow runs the validator every Monday at 03:00
  Europe/Berlin and on demand, and opens one `[Skills check]` issue with a suggested fix per finding, closing the
  previous one.

## 2026-10-27

### Added

- **MIT license:** a `LICENSE` file, so the skill keeps its license when it's shared on its own.

## 2026-10-24

### Added

- **This changelog.** The skill's history in one file, from its commits and the Changelog table that
  `SKILL.md` used to have.
- **Changelog check.** `agent-src/sync/check-changelogs.ps1` reports a skill without `CHANGELOG.md` (`MISSING`), a
  changed skill whose changelog didn't change (`NO ENTRY`), a changed changelog without a release for today
  (`NO RELEASE`), and a `SKILL.md` that still has a Changelog section (`TABLE`), and exits non-zero. With `-Create` it writes a missing changelog from the template; `-Base`
  also counts unpushed commits. The skill's new step 2 explains each result and its fix.
- **Changelogs created on every sync.** `sync.ps1` runs the check with `-Create` before fanning out, so a new
  skill's changelog reaches `.claude/skills/` and `.github/skills/`; problems are warnings there.

## 2026-10-22

### Changed

- **Breaking: renamed from `hso-skills-sync` to `aidevme-skills-sync`.** Invoke it by the new name; `AGENTS.md` and
  the manifest were updated. (cb3bf7d)

## 2026-09-10

### Added

- **The skill**, rewritten from HINT's twin-mirror reconciler into a verification backstop for the source-committed
  model: it reports orphans, drift, cross-tool mismatches and stray files, and the fix is always to re-run
  `sync.ps1`. The double-nesting bug is designed out. (Before this repository, by maciejnowicki; no commit here.)
