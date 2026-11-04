# Research: an infographic of solution-blueprint-ci for colleagues

<!-- cspell:ignore Napkin Eraser Lucidchart Whimsical Piktochart PPSB Dataverse -->

**Date:** 2026-11-04 · **Requested by:** Zsolt Zombik · **Question:** how to create an infographic that presents
solution-blueprint-ci to colleagues.

---

## 1. Summary and recommendation

Build the infographic as **one HTML page** with inline SVG, made from this repo's own facts. Render the architecture
strip with **draw.io** (`aidevme-diagram-drawio`). Export the page to PNG or PDF for slides and chat. This route:

- keeps every word as real, editable text (AI image generators garble text, and section 6 of `AGENTS.md` bans
  generated text in images);
- reuses the skills and tooling the repo already has, with no new account or licence;
- can be shared as a private claude.ai Artifact link, or exported to a PNG for a slide or a Teams message;
- stays honest about status: the product is in early development and blueprint generation is still a stub
  (`PLAN.md`), so the page has to present the **target design**, not shipped features.

If colleagues expect a branded, template look, the alternative is **Canva** (the marketing plugin's Canva connector
needs authorising first). Use draw.io for the architecture part either way: reviewers consistently recommend a
dedicated diagram tool over Canva for technical diagrams.

---

## 2. What the infographic should say

Design guidance agrees on one message per page, a clear hierarchy and little text. A technical audience can take more
detail than a general one. One sentence for this page, from `README.md`:

> **solution-blueprint-ci turns a Dataverse solution into always-current architecture documentation on every build.**

Content blocks, top to bottom (all from `README.md`):

| # | Block | Content | Visual |
| --- | --- | --- | --- |
| 1 | Headline | The one sentence above, with an "early development" status badge | Title band |
| 2 | Problem → fix | PPSB runs interactively in PPTB Desktop, so the docs go stale. This tool runs the same analysis on every build or release | Two panels: before and after |
| 3 | How it works | GitHub Action / Azure DevOps task / CLI → `blueprint-core` → Dataverse Web API → Markdown · HTML · JSON · ZIP | Left-to-right flow (draw.io) |
| 4 | What it discovers | Tables and relationships; plugins; flows and workflows; web resources, PCF and custom APIs; environment variables and connection references; apps and Copilot Studio agents; security | Icon grid, 6 to 8 tiles |
| 5 | What it analyses | ERD (Mermaid, draw.io), execution pipeline per table, automation chains, external dependency risk, complexity scoring | Short list with icons |
| 6 | Built for CI/CD | Service principal or OIDC, quality gates (`--fail-on`), deterministic diffs in pull requests | Three badges |
| 7 | Get started | `npx @aidevme/blueprint-cli generate …`, the docs site URL, QR code optional | Footer |

Keep it to 7 blocks at most. Anything more belongs on the docs site, with a link to it.

---

## 3. Tool options compared

| Option | Strength | Weakness for this case | Fits the repo? |
| --- | --- | --- | --- |
| **HTML page + inline SVG** (claude.ai Artifact) | Real text, light and dark themes, a shareable private link, exports to PNG or PDF | Needs a design pass; less "designed" than a template | ✅ No new tool |
| **draw.io** (`aidevme-diagram-drawio`, `drawio` MCP) | Exact architecture flow, SVG/PNG export, no design skills needed | A whole infographic in draw.io is laborious | ✅ Already set up |
| **Mermaid** (`aidevme-diagram-mermaid`) | Diagram as code, diffable | Auto layout; little visual control for a poster | ✅ For the flow only |
| **Canva** | Templates, brand kits, polished look | Weaker for technical diagrams; connector needs authorising | ⚠️ Optional |
| **Napkin AI** | Turns prose into visuals and exports SVG for refining | Diagram accuracy depends on the input; output needs checking | ⚠️ For drafts only |
| **Figma** | Collaborative canvas, fine control | A design tool to learn; connector needs authorising | ⚠️ If the team uses it |
| **Eraser, Lucidchart, Whimsical, Miro** | Dedicated architecture diagramming | One more tool and licence for a single page | ❌ Not needed |
| **PowerPoint (SmartArt, one slide)** | Familiar to colleagues, easy to present | Hard to keep consistent and reuse | ⚠️ As the export target |
| **AI image generation** (Gemini and others) | Fast mood images | Garbled text, invented UI; against `AGENTS.md` section 6 | ❌ |

Licences and features weren't checked against vendor pages: [VERIFY: current Canva, Napkin AI and Figma plans if
one is chosen].

---

## 4. Suggested steps (recommended route)

1. **Agree the message and the blocks** (section 2). Decide whether colleagues see it on screen, as a slide or as
   a print-out. That decides portrait (A4 or poster) or landscape (16:9).
2. **Sketch the layout** on paper or as an ASCII mock-up first. The guides agree on planning before opening a tool.
3. **Draw the architecture flow** (block 3) with `aidevme-diagram-drawio` and export SVG. Keep the source `.drawio`
   next to it, in `assets/` or `docs/`.
4. **Build the page** as HTML with that SVG and the icon grid. The repo already has `@fluentui/svg-icons` and
   `simple-icons` as dev dependencies; check each brand's terms before using its logo (GitHub, Azure DevOps, npm).
5. **Review the facts** against `README.md` and `PLAN.md`. Keep the "early development" badge until generation works.
6. **Export:** share the Artifact link, or screenshot it to PNG or print it to PDF (the `playwright-cli` skill or
   `@playwright/test` can render it at a fixed size) for a slide.
7. **Optional:** if a branded look is wanted, rebuild blocks 1, 2 and 4 in Canva and import the draw.io SVG for
   block 3.

---

## 5. Open questions for Zsolt

- Audience: developers and architects, or managers too? This decides how much detail goes into blocks 4 and 5.
- Format: screen (Artifact link), slide (16:9 PNG) or print (A4 PDF)?
- Branding: aidevme.com colours, an employer's brand, or neutral? Leave employer and client names off, per
  `AGENTS.md` section 6.
- Should it go in the repo (for example `assets/` and the README), or stay a one-off for the presentation?

---

## Sources

- [Guideflow: infographic software](https://www.guideflow.com/blog/infographic-software)
- [Fast.io: Napkin AI review 2026](https://fast.io/resources/napkin-ai-review-2026/)
- [Dupple: best AI diagram tools 2026](https://dupple.com/learn/best-ai-diagram-tools)
- [Coda One: AI diagram tools](https://www.codaone.ai/best/ai-diagram-tools)
- [ConceptViz: Canva diagramming review](https://conceptviz.app/blog/canva-diagramming-review-alternatives-guide)
- [Storyboard That: what is a technical infographic](https://www.storyboardthat.com/create/infographics-technical)
- [Piktochart: infographic design tips](https://piktochart.com/blog/infographic-design-tips.md)
- [Harry Designer: infographic design best practices](https://harrydesigner.substack.com/p/infographic-design-best-practices)
- [Syracuse University: infographics tutorial (PDF)](https://ridlr.syr.edu/wp-content/uploads/2020/10/INFOGRAPHICS-TutorialPDFVersion.pdf)
- Repo: `README.md`, `PLAN.md`

Most web sources are vendor blogs and listicles; they were used for general direction, not for specific claims.
