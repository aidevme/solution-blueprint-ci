# Changelog

<!-- cspell:ignore aidevme evals Evals Dataverse frontmatter cheatsheet marketingskills crawlability libavoid jgraph mxgraph -->
<!-- markdownlint-configure-file { "MD024": { "siblings_only": true } } -->

All notable changes to the **aidevme-diagram-drawio** skill: draw.io (diagrams.net) diagrams rendered as SVG or PNG for Markdown documents and reveal.js decks. Newest first. Each entry says what changed and why it
matters to you; the commit has the detail. The source is `agent-src/skills/core/delivery/aidevme-diagram-drawio/`, synced to
`.claude/skills/` and `.github/skills/`.

## 2026-10-29

### Fixed

- **SVGs stay light in dark mode:** draw.io writes every colour twice, a light and a dark version, and lets the
  viewer choose, so a dark-mode page or the dark-mode WordPress admin showed the diagram on black.
  `Render-DrawioDiagram.ps1` now pins SVG output to the light palette (`color-scheme: light`). Pass
  `-AdaptiveColors` to keep draw.io's dark-mode colours. For a white background rather than a transparent one,
  set `background="#FFFFFF"` on the `mxGraphModel`.

## 2026-10-27

### Added

- **Edge routing:** `Render-DrawioDiagram.ps1 -RouteEdges` reroutes connectors around shapes with draw.io's
  libavoid router before export, so an arrow no longer draws over a box it passes. Shapes stay where you put
  them. It rewrites your `.drawio` in place, so commit the rerouted file; it needs a draw.io Desktop build that
  supports `--layout`. The Edge Routing Rule stays in force: routing is a safety net, not a licence for tangles.
- **draw.io MCP server:** the project `.mcp.json` registers jgraph's `@drawio/mcp` as `drawio`. `SKILL.md`
  says when to use `search_shapes` (style strings for Azure and other vendor icons, instead of guessed
  `mxgraph.*` names), `open_drawio_xml` (preview and tune in the editor) and `get_drawio_reference`, and why
  the hosted App Server and jgraph's Claude Code plugin are not used.
- **jgraph/drawio-diagrams** under References, as a structural reference for Azure, ERD, sequence and C4
  layouts.
- **MIT license:** a `LICENSE` file, so the skill keeps its license when it's shared on its own.

### Changed

- **Exports stay editable:** SVG, PNG and PDF now embed the diagram XML (`--embed-diagram`), so an exported
  file reopens in draw.io as an editable diagram. Pass `-NoEmbedDiagram` for a smaller file without it.
- **Workflow** gained a routing step; the render check is now step 5.

## 2026-10-24

### Added

- **This changelog.** The skill's history in one file, from its commits. `SKILL.md` keeps its short Changelog
  table.

## 2026-10-22

### Added

- **The skill itself:** draw.io diagrams for system context, architecture, ERD, sequence and process flows,
  rendered as SVG for Markdown and reveal.js, with PNG or PDF for print. Styles come from
  [references/hso-drawio-styles.md](references/hso-drawio-styles.md); the XML cheatsheet and integration patterns
  are in `references/`. (71ac040)
- **Templates, examples and a renderer:** five `.drawio` templates in `templates/` (architecture, ERD, process
  flow, sequence, system context), a rendered SVG of each in `examples/`, and `scripts/Render-DrawioDiagram.ps1`
  to export your diagrams. (71ac040)
