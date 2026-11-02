# block-beta (beta)

Use for block layouts with explicit columns (layered architecture, capability grids). **Always validate.**

```mermaid
block-beta
  columns 3
  ui["Model-driven app"]:3
  api["Web API"] logic["Plugins"] flow["Flows"]
  db[("Dataverse")]:3
```

- `columns N`; `id["Label"]:span`; `space` for gaps; arrows `a --> b`.
- Put the title and description in the caption (block-beta has no `accTitle` support in all renderers).
