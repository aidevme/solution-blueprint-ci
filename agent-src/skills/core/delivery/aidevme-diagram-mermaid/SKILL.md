---
name: aidevme-diagram-mermaid
metadata:
  layer: atomic
  scope: core
description: |
  Turn requests, code or architecture descriptions into valid, readable, accessible Mermaid diagrams, validated
  and rendered through the Mermaid Chart MCP server or a fallback, and delivered as a ```mermaid block, a .mmd
  file, PNG/SVG, or a Mermaid Chart project. Use whenever the user says "diagram", "flowchart", "sequence
  diagram", "ERD", "ER diagram", "data model", "state machine", "architecture diagram", "C4", "Gantt", "timeline",
  "mind map", "visualize this flow", "draw the process" or "document this solution"; whenever Mermaid, a .mmd file
  or a ```mermaid block is mentioned; and whenever broken Mermaid needs fixing. Also use proactively when
  explaining a process with 3+ components, an API or integration flow, a Dataverse schema, a plugin pipeline, a
  Power Automate flow, or a Copilot Studio topic/agent flow. Does NOT produce pixel-precise or branded-icon layouts
  (see aidevme-diagram-drawio), hand-drawn sketches or strict UML tooling output, or answer plain conceptual
  questions that need no picture.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion
argument-hint: "[what to draw, a file to visualise, or broken Mermaid to fix]"
---

# aidevme-diagram-mermaid

<!-- cspell:ignore mmdc kroki accTitle accDescr classDef statuscode -->

Mermaid diagrams that are **validated before they are delivered**, readable in light and dark mode, and
accessible. Tuned for Power Platform / Dynamics 365 CE work (Dataverse, Power Automate, Copilot Studio, PCF,
Azure integration) but usable for any software or business diagram.

Core rule: **never deliver Mermaid as validated unless a backend actually validated it.**

## When Mermaid is the wrong tool

Say so and suggest the alternative instead of forcing it:

| Need | Use instead |
| --- | --- |
| Pixel-precise layout, branded/vendor icons, client sign-off deliverable | `aidevme-diagram-drawio` |
| Hand-drawn / whiteboard feel | Excalidraw |
| Strict UML (full stereotypes, deployment diagrams, tooling round-trip) | PlantUML |
| More than ~25 nodes in one picture | Split into several Mermaid diagrams |

## Workflow

### 1. Detect the backend

Probe in this order and use the first that works. Details, configs and error handling:
[references/mcp-mermaid-chart.md](references/mcp-mermaid-chart.md).

1. **Mermaid Chart MCP Server** or **Mermaid Claude MCP App** — any available tool named
   `validate_and_render_mermaid_diagram`.
2. **Community Mermaid MCP** already configured — `validateMermaid`, `validate_mermaid_diagram`,
   `generate_mermaid_diagram`.
3. **Local `mmdc`** — `scripts/validate_local.sh <file.mmd>` (it also falls back to Kroki).
4. **Kroki** HTTP API — same script, `--backend kroki`.
5. **None** — deliver the code with a Mermaid Live link and state plainly: *"Not validated — no renderer available."*

**Read the tool schema before calling.** Parameter names differ between servers (for example `diagramCode` in
the Claude MCP App). Never hard-code them.

**Auth errors** (Mermaid Chart MCP needs a Mermaid account, free tier is enough): tell the user to complete the
OAuth sign-in their client opens, or to configure an `Authorization` header in their MCP client config. Never ask
for a token in chat, never write one to a file, never echo one back.

### 2. Clarify only if necessary

Ask (one `AskUserQuestion`, at most three items) only when the request leaves these genuinely open: diagram
type, scope / level of detail, output target. Otherwise default: type from step 3, the level of detail the
request implies, output = Markdown block.

### 3. Choose the diagram type

Use [references/diagram-selection.md](references/diagram-selection.md). Power Platform quick map:

| Scenario | Diagram |
| --- | --- |
| Dataverse tables and relationships (1:N, N:N) | `erDiagram` |
| Plugin pipeline (PreValidation → PreOperation → MainOperation → PostOperation), sync/async | `sequenceDiagram` |
| Business Process Flow stages, statecode/statuscode lifecycle | `stateDiagram-v2` |
| Power Automate / Logic Apps flow with conditions | `flowchart TD` |
| Solution architecture (D365, Azure Functions, Service Bus, APIM, Entra ID) | `C4Context` / `C4Container` or `architecture-beta` |
| Copilot Studio agent: topics, actions, MCP / connector calls | `flowchart LR` or `sequenceDiagram` |
| ALM pipeline (dev → test → prod, managed solutions) | `flowchart LR` or `gitGraph` |
| Project / migration plan | `gantt` / `timeline` |
| Workshop ideation, capability map | `mindmap` |

Then open the matching template in `references/types/<type>.md`.

### 4. Write the code

- Follow [references/syntax-pitfalls.md](references/syntax-pitfalls.md) (reserved words, quoting, escaping, v11 rules).
- Apply [references/styling-and-branding.md](references/styling-and-branding.md): `base` theme, ≤ 5 colours,
  shared `classDef`s, short labels (≤ ~5 words).
- Apply [references/accessibility.md](references/accessibility.md): every diagram has `accTitle` and `accDescr`.
- Configure via YAML frontmatter (`---\nconfig: ...\n---`), not `%%{init}%%`, where the target supports it.

### 5. Validate and render

Send the code to the backend. On a syntax error: read the message, fix the specific cause, re-validate. **Max 3
attempts**; then show the last error and the best code, marked *not validated*.

### 6. Self-check the render

If a PNG/SVG came back, look at it. Check for clipped or overlapping labels, more than ~25 nodes, wrong
orientation (long chains → `LR`, deep hierarchies → `TD`), and avoidable edge crossings. Fix and re-validate —
**max 2 auto-fix rounds**. Over ~25 nodes: split into an overview plus detail diagrams.

### 7. Enrich

When available, call `get_diagram_title` and `get_diagram_summary`. Use the title for `accTitle` and the file
name; use the summary for `accDescr` and the caption. Re-validate if you changed the code.

### 8. Deliver

| Target | Output |
| --- | --- |
| Markdown / docs / blog (default) | ```` ```mermaid ```` block + a one-sentence caption that doubles as the text alternative |
| File | `<kebab-title>.mmd`, plus `.svg` / `.png` when rendered |
| Mermaid Chart | `list_mermaid_chart_projects` → **ask which project and confirm** → `create_mermaid_chart_diagram` or `update_mermaid_chart_diagram` |

Always include the Mermaid Live edit link when the backend returns one. State which backend validated it.
For GitHub / Azure DevOps wiki targets, note that their bundled Mermaid can lag (beta types may not render).

### 9. Iterate

Apply targeted edits to the existing code on feedback — do not regenerate from scratch. Re-validate after every
edit. **Cap at 5 rounds**; then suggest splitting the diagram or a different tool.

## Guardrails

- **Never write to a Mermaid Chart project without explicit confirmation** of the project and the action
  (create vs update).
- **Never store, log or echo auth tokens.**
- **Cloud saves and confidential names:** before saving to Mermaid Chart (or rendering via Kroki, a public
  service), check for customer, person or environment names. Offer to anonymise ("Customer A", `{{org}}`) and
  proceed only after the user confirms.
- Never present unvalidated code as validated.

## Verify

Before reporting done, state each result:

- [ ] Backend used, and its result is *valid* (or the output is clearly marked *not validated*).
- [ ] `accTitle` and `accDescr` present; a one-sentence text alternative accompanies the diagram.
- [ ] ≤ ~25 nodes per diagram; ≤ 5 colours; meaning never carried by colour alone.
- [ ] Any Mermaid Chart write was confirmed by the user first.

## Error handling

| Situation | Action |
| --- | --- |
| MCP auth rejected | Explain OAuth sign-in / header config; do not ask for the token; fall back to the next backend |
| Parse error after 3 fixes | Show the error, the best code, and mark it not validated |
| Beta type rejected (`architecture-beta`, `block-beta`, …) | Rebuild as `flowchart` with subgraphs and re-validate |
| Renderer lags target (GitHub, ADO wiki) | Prefer stable types; say which features may not render |
| Kroki / network unavailable | Use the next backend; never silently skip validation |

## Example (abbreviated)

**Request:** "Show how a sync PreOperation plugin and an async PostOperation plugin run when an Opportunity is won."

1. Backend: `validate_and_render_mermaid_diagram` found; schema read.
2. Type: `sequenceDiagram` (plugin pipeline) → template `references/types/sequence.md`.
3. Code with `autonumber`, `accTitle`/`accDescr`, `alt` for the sync failure path, `par` for async work.
4. Validated on first attempt; PNG checked; no clipping.
5. Delivered as a ```mermaid block + caption + Mermaid Live link.

Full validated samples: [examples/](examples/).
