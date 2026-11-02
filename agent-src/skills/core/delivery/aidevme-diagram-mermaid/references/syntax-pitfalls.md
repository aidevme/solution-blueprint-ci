# Mermaid v11 syntax pitfalls

<!-- cspell:ignore accTitle accDescr classDef -->

Check these before every validation. Most parse errors come from the first five sections.

## 1. Keywords and current forms

- Use `flowchart`, not `graph` (same syntax, more features, the maintained renderer).
- Use `stateDiagram-v2`, not `stateDiagram`.
- **Lowercase `end` as a node ID or bare label breaks flowcharts and sequence blocks.** Use `End`, `done`, or
  quote it: `E["end"]`.
- Other risky bare words as IDs: `class`, `click`, `style`, `default`, `subgraph`, `graph`, `call`. Rename.

## 2. Edges that turn into shapes

- A node ID starting with `o` or `x` right after `--` / `---` creates a circle or cross edge:
  `A---oB` is a circle-ended edge. Write `A --- oB` (spaces) or rename the node (`opsB`).

## 3. Quoting labels

- Quote any label containing `( ) [ ] { } : ; , # | " < > @ &` or leading/trailing spaces:
  `A["Call API (POST)"]`, `B{"Valid? (Y/N)"}`.
- Inside quotes, use entity codes: `#quot;` for `"`, `#35;` for `#`, `#59;` for `;`, `#lt;` / `#gt;` for `<` `>`.
- Markdown strings: ``A["`**Bold** and _italic_`"]`` (backtick inside quotes).
- Line breaks inside labels: `<br/>` (quoted label).

## 4. IDs

- No spaces; don't start with a hyphen or digit-only (`1` works but is fragile); keep IDs ASCII.
- Put the human text in the label: `acct["Account (Dataverse)"]`.
- Subgraphs: `subgraph sgCrm["Dynamics 365 CE"] ... end` — ID first, then quoted title. Reference the ID in edges.
- Reusing an ID reuses the node — handy for joins, surprising for typos.

## 5. Comments and directives

- `%%` comments on their **own line** only. A trailing `%%` after code can break parsing.
- Configure with YAML frontmatter, not the deprecated `%%{init: ...}%%`:

  ```text
  ---
  title: Optional title
  config:
    theme: base
    themeVariables:
      primaryColor: "#E8F1FB"
  ---
  flowchart LR
    A --> B
  ```

  Frontmatter must be the very first lines. Some older renderers (GitHub / ADO wikis) ignore it — then
  `%%{init}%%` is the only option; say so when you use it.

## 6. Accessibility lines

- `accTitle: Short title` — single line.
- `accDescr: One sentence` or multi-line `accDescr { ... }`.
- Place them right after the diagram-type line. Supported in flowchart, sequence, class, ER, state, gantt,
  journey, pie, quadrant, gitGraph, mindmap (v11+), C4, architecture. If a renderer rejects them for a type,
  move the description to the caption.

## 7. Type-specific rules

### ER (`erDiagram`)
- Attribute lines: `type name [PK|FK|UK] ["comment"]`. **Type has no spaces** (`string`, `datetime`,
  `decimal`, `uniqueidentifier`); use `_` or camelCase in names.
- Multiple keys: `uniqueidentifier accountid PK, FK`.
- Cardinality: `||` exactly one, `|o` zero or one, `}|` one or more, `}o` zero or more. Example
  `ACCOUNT ||--o{ CONTACT : "has"`.
- **Quote relationship labels** if they contain spaces: `: "primary contact"`.
- `--` identifying (solid), `..` non-identifying (dashed).
- Entity names with hyphens or spaces need an alias: `p["aidev_project"]` is not valid; use
  `aidev_project` (underscore is fine) or `PROJECT["Project"]` alias syntax in v11.

### Sequence (`sequenceDiagram`)
- Blocks: `alt … else … end`, `opt … end`, `loop … end`, `par … and … end`, `critical … option … end`,
  `break … end`, `rect rgb(…) … end`. Every block closes with `end`.
- `activate X` / `deactivate X` (or `->>+` / `-->>-`) **must balance**, or rendering fails.
- `autonumber` on its own line after the header.
- Participants: `participant P as "Plugin (sync)"`; `actor U as User`.
- Semicolons and `#` in messages: use `#59;` / `#35;`.

### Class (`classDiagram`)
- Generics with tildes: `List~Account~`, `class Repository~T~`.
- Visibility: `+` public, `-` private, `#` protected, `~` package; `$` static, `*` abstract (suffix).
- Relationships: `<|--` inheritance, `*--` composition, `o--` aggregation, `-->` association, `..>` dependency,
  `..|>` realisation.

### State (`stateDiagram-v2`)
- Start/end: `[*] --> Active`, `Resolved --> [*]`.
- Composite: `state Active { [*] --> InProgress ... }`.
- States with spaces: `state "On Hold" as OnHold`.
- Notes: `note right of Active ... end note`.

### Gantt
- `dateFormat YYYY-MM-DD` required; task IDs without spaces; `after id` for dependencies.
- Excludes: `excludes weekends`.

### C4
- Use `C4Context` / `C4Container` / `C4Component` / `C4Dynamic` / `C4Deployment`.
- Element macros take quoted string arguments: `System(crm, "Dynamics 365 CE", "Sales and service")`.
- Layout is automatic and limited; keep ≤ ~15 elements; use `UpdateLayoutConfig($c4ShapeInRow="3")`.

## 8. Beta types

`architecture-beta`, `block-beta`, `packet-beta`, `kanban`, `radar-beta`, `treemap-beta`, `xychart-beta`,
`sankey-beta`:
- **Always validate**; syntax changes between minor versions.
- Keep labels simple (no punctuation inside `[...]` for architecture-beta).
- If the target renderer rejects the type, rebuild as `flowchart` with subgraphs.

## 9. Renderer lag

GitHub, GitLab and Azure DevOps wikis bundle their own Mermaid version, which can trail the latest by months.
When targeting them: prefer stable types, avoid the newest shapes (`A@{ shape: … }`), and test-render there
if the user can.
