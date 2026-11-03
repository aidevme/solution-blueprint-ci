# Changelog

<!-- cspell:ignore hso ForgeUSA tsdoc -->
<!-- markdownlint-configure-file { "MD024": { "siblings_only": true } } -->

All notable changes to the **aidevme-vitepress** skill: changes to the VitePress docs site, checked against the official VitePress docs. Newest first. Each entry says what changed and why
it matters to you; the commit has the detail. The source is `agent-src/skills/core/delivery/aidevme-vitepress/`, synced to
`.claude/skills/` and `.github/skills/`.

## 2026-11-03

### Added

- **Creating a site.** A new VitePress site is created in a top-level `github-pages/` folder and deployed to GitHub
  Pages through an Actions workflow, with the base path, scripts, ignored folders and workflow paths set for that
  folder. You set the Pages source yourself. A site that already lives elsewhere stays there unless you agree to
  move it. A new eval covers this.

## 2026-10-27

### Added

- **MIT license:** a `LICENSE` file, so the skill keeps its license when it's shared on its own.

## 2026-10-24

### Changed

- **Changelog table removed from `SKILL.md`.** This file is now the skill's only history; every row of the
  table was already covered here.

## 2026-10-21

### Added

- **This changelog.** The skill's history in one file, from its commits, following
  `docs/templates/CHANGELOG_STYLE.md`. `SKILL.md` keeps its short Changelog table.

## 2026-10-18

### Changed

- **Frontmatter valid under the Agent Skills specification.** `layer` and `scope` moved under `metadata`, so the
  skill passes `agent-src/sync/validate-skills.ps1` (skills-ref). (b8fcdcf)

## 2026-10-17

### Added

- **The skill itself.** Pages, sidebar, nav and config changes, Vue template errors in Markdown and dead links,
  verified with `docs:build`. VitePress questions are answered from the official docs through the Vue Docs MCP
  server (vue-mcp.org), with setup for Claude Code and VS Code Copilot; without the server, answers are marked
  "VitePress docs not checked". (b22228a)
