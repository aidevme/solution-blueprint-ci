# Changelog

<!-- cspell:ignore aidevme Kroki mmdc evals Evals Dataverse frontmatter cheatsheet marketingskills crawlability -->
<!-- markdownlint-configure-file { "MD024": { "siblings_only": true } } -->

All notable changes to the **aidevme-diagram-mermaid** skill: valid, readable and accessible Mermaid diagrams. Newest first. Each entry says what changed and why it
matters to you; the commit has the detail. The source is `agent-src/skills/core/delivery/aidevme-diagram-mermaid/`, synced to
`.claude/skills/` and `.github/skills/`.

## 2026-11-01

### Changed

- **Shorter description:** cut to the 1,024-character limit of the Agent Skills specification, with every trigger
  phrase kept. The named fallback renderers are now only in `SKILL.md`.

## 2026-10-27

### Added

- **MIT license:** a `LICENSE` file, so the skill keeps its license when it's shared on its own.

## 2026-10-24

### Added

- **This changelog.** The skill's history in one file, from its commits and the Changelog table that
  `SKILL.md` used to have.

## 2026-10-22

### Added

- **The skill itself:** turns a request, code or an architecture description into a Mermaid diagram that is
  validated through the Mermaid Chart MCP server, with the community Mermaid MCP server, local `mmdc` and Kroki as
  fallbacks. It delivers a Mermaid code block, a `.mmd` file, PNG or SVG. (05ee870)
- **References for choosing and styling diagrams:** Power Platform diagram selection, Mermaid v11 syntax pitfalls,
  styling and branding, and accessibility (title and description for screen readers), in `references/`.
  (05ee870)
- **Templates and examples:** 14 diagram-type templates in `references/types/` and 5 validated examples in
  `examples/` (ALM pipeline, C4 container, case lifecycle, Dataverse ERD, plugin pipeline), plus
  `scripts/validate_local.sh` and `scripts/extract_mermaid.py` for local checks. (05ee870)
- **Evals:** five cases that should trigger the skill and one that shouldn't. (05ee870)
