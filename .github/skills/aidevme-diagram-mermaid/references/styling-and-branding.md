# Styling and branding

<!-- cspell:ignore classDef themeVariables lineColor -->

Restraint first: a diagram is read for structure, not decoration.

## Rules

- Theme `base` (the only theme that honours `themeVariables` fully).
- **≤ 5 colours** per diagram, including neutral.
- **Never encode meaning by colour alone** — pair colour with a label, shape, icon prefix or legend line.
- Readable in light **and** dark mode: mid-saturation fills with dark text, explicit `color:` on every class.
- Short labels (≤ ~5 words). Details go in notes, `accDescr`, or the surrounding prose.

## AIDevMe brand tokens

Fill these in once; every `classDef` below references them. Until filled, the neutral defaults apply.

| Token | Role | Default (neutral, WCAG AA with `#1F2937` text) |
| --- | --- | --- |
| `{{AIDEVME_PRIMARY}}` | Brand accent (own components) | `#DBEAFE` |
| `{{AIDEVME_SECONDARY}}` | Secondary accent | `#E0E7FF` |
| `{{AIDEVME_ACCENT}}` | Highlight | `#FEF3C7` |
| `{{AIDEVME_TEXT}}` | Text on fills | `#1F2937` |
| `{{AIDEVME_LINE}}` | Lines and borders | `#475569` |

When the author fills the tokens, re-check contrast ([accessibility.md](accessibility.md)).

## Frontmatter template

```text
---
config:
  theme: base
  themeVariables:
    primaryColor: "#DBEAFE"
    primaryTextColor: "#1F2937"
    primaryBorderColor: "#475569"
    lineColor: "#475569"
    fontFamily: "Segoe UI, Inter, Arial, sans-serif"
---
```

## Shared `classDef`s

Paste only the ones the diagram uses.

```text
classDef external  fill:#F1F5F9,stroke:#475569,color:#1F2937,stroke-dasharray:4 3
classDef dataverse fill:#DBEAFE,stroke:#1D4ED8,color:#1F2937
classDef azure     fill:#E0F2FE,stroke:#0369A1,color:#1F2937
classDef copilot   fill:#EDE9FE,stroke:#6D28D9,color:#1F2937
classDef warning   fill:#FEF3C7,stroke:#B45309,color:#1F2937,stroke-width:2px
```

| Class | Use for | Non-colour cue |
| --- | --- | --- |
| `external` | Third-party / out-of-scope systems | Dashed border |
| `dataverse` | Dataverse / D365 CE components | Label prefix or legend |
| `azure` | Azure services | Label prefix or legend |
| `copilot` | Copilot Studio agents, MCP servers | Label prefix or legend |
| `warning` | Risk, failure path, manual step | Thick border + "⚠" in label |

Apply with `A:::dataverse` or `class A,B dataverse`.

## Per-type notes

- **Sequence:** colour via `rect rgb(…)` blocks sparingly (one highlighted phase), not per message.
- **ER / class:** leave default styling; structure carries the meaning.
- **C4:** use the built-in element styling; override with `UpdateElementStyle` only for the brand accent.
- **Gantt / timeline / mindmap:** theme variables only; no `classDef`.
