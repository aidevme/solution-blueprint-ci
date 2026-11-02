# Accessibility

<!-- cspell:ignore accTitle accDescr -->

Every diagram ships with a title, a description and a text alternative.

## In the diagram

```text
flowchart LR
  accTitle: Case escalation flow
  accDescr: A new case is triaged; high-priority cases go to tier 2, others are resolved by tier 1.
  ...
```

Multi-line:

```text
accDescr {
  Line one of the description.
  Line two.
}
```

- `accTitle` ≤ ~8 words; `accDescr` 1–3 sentences describing the **meaning**, not the shapes.
- Reuse `get_diagram_summary` output when the Mermaid Chart MCP provides it.
- Place both right after the diagram-type line (after frontmatter).

## Around the diagram (docs / blog)

- A one-sentence caption under the block that works as alt text on its own.
- When exporting PNG/SVG for a page: `alt` attribute = the caption; for complex diagrams, link to or include a
  short prose/table equivalent.

## Colour and contrast

- Text on fills: **≥ 4.5:1** (WCAG 2.1/2.2 AA, 1.4.3). Large text (≥ 18.66px bold / 24px): ≥ 3:1.
- Lines and borders that carry meaning: ≥ 3:1 against the background (1.4.11).
- No red/green-only distinctions; pair colour with shape, border style, label or a legend (1.4.1).
- The default palette in [styling-and-branding.md](styling-and-branding.md) uses `#1F2937` text on light fills
  (all ≥ 10:1). Re-check when brand tokens are filled — e.g. with a contrast checker or the formula
  `(L1 + 0.05) / (L2 + 0.05)`.

## Structure

- ≤ ~25 nodes; split otherwise — large diagrams are unreadable with screen magnifiers.
- Meaningful labels (no "Step 1", "Box A").
- Consistent direction; avoid crossing edges where a reorder fixes them.
