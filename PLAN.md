# solution-blueprint-ci — Plan and progress

<!-- cspell:ignore aidevme Zsolt Zombik Yoast Substack worklog WebP maciejnowicki Dataverse worktree PPSB -->

**Mission.** Generate architecture documentation for Power Platform and Dataverse solutions in CI/CD: a headless
engine built on Power Platform Solution Blueprint (PPSB), packaged as an npm CLI, a GitHub Action and an Azure DevOps
task. See [`README.md`](README.md).

**Owner:** Zsolt Zombik · **Last updated:** 2026-11-02

**Provenance:** the agent layer (single-source sync to Claude Code and GitHub Copilot, the `agent/` wiki, the
core/project skill split) comes from a Power Platform project template built by maciejnowicki (2026-09-10).
Its server, client, PCF and pipeline parts aren't used here. It reached this repo by way of `aidevme-blog`, which is
why parts of it still describe the blog.

---

## Built

Legend: ✅ done · 🔄 in progress · ⬜ not started

| Area | What exists | Status |
| --- | --- | --- |
| Product | pnpm workspace in `packages/` (`core`, `cli`, `gh-action`, `ado-task`) with input handling, a token-based Dataverse client and tests; blueprint generation is a stub, and the wrappers don't pass credentials yet. Design and roadmap are in `README.md` | 🔄 |
| Agent layer | `AGENTS.md` → `CLAUDE.md` / Copilot instructions; 11 skills and the `change-reviewer` agent synced to `.claude/` and `.github/`; `verify-parity.ps1`; not committed yet | 🔄 |
| Changelogs | A `CHANGELOG.md` per skill (the only history); `check-changelogs.ps1` creates missing ones and gates changes; the style guide is missing | 🔄 |
| Diagrams | `aidevme-diagram-mermaid`, `aidevme-diagram-drawio` | ✅ |
| Skills check | `skills-validation` agentic workflow: weekly `validate-skills.sh` run reporting a `[Skills check]` issue; not on `main` yet | 🔄 |
| Pull request review | `pr-review` agentic workflow: non-blocking review with inline comments and a summary; not on `main` yet, first run still to confirm | 🔄 |
| Repo hygiene | Issue forms for the product and repo tooling, `SECURITY.md`, `.gitignore` | ✅ |
| Docs site | VitePress 2.0.0-alpha.18 site in `github-pages/`, built on pull requests and deployed to GitHub Pages by `docs.yml`; Pages not enabled and not deployed yet | 🔄 |

---

## Open

### Product

- ⬜ Prove `TokenDataverseClient` against a demo environment, then copy PPSB's `src/core` as ADR-0010 describes.
- ⬜ Record the package layout as an ADR.
- ⬜ Build the rest of the roadmap in `README.md`.
- ⬜ Before the first publish: claim the `@aidevme` npm scope, confirm the `aidevme` Visual Studio Marketplace
  publisher, and verify the `powerplatform-spn` service connection type in `packages/ado-task/task.json`.
- ⬜ Decide the role of `--publishers`, and whether the Azure Artifacts section stays in `README.md` now that npm is
  the main route.

### Release and workflow

- ⬜ Before the first commit of the agent layer, check `agent-src/` for internal names (HSO, ForgeUSA, CDX, HINT):
  this repo is public, and they remain in `aidevme-diagram-drawio`, `aidevme-shared-scripts`, the manifest, the sync
  scripts and several changelogs.
- ⬜ Commit the agent layer to `dev`. `check-changelogs.ps1` reports every skill until then, because `agent-src/` is
  untracked.
- ⬜ Merge `dev` into `main`. Scheduled workflows run from `main`, so workflow changes take effect only after the
  merge.
- ⬜ Watch the first `pr-review` and `skills-validation` runs.
- ⬜ Set the GitHub Pages source to GitHub Actions, run the first `docs.yml` deployment from `main`, and set the
  repository's website field to the site URL.

### Agent layer

- ⬜ `AGENTS.md`: rewrite it for this project; sections 1, 3, 6, 7 and 8 still describe aidevme.com, and its rule about
  a skills table in `README.md` has no table to apply to.
- ⬜ Create the `skill` label; the tooling issue forms use it and it doesn't exist on the repo yet.
- ⬜ Turn on GitHub private vulnerability reporting; `SECURITY.md` and the issue form links depend on it.
- ⬜ `.templates/` is missing, but `AGENTS.md` and `check-changelogs.ps1` point to its style guides: restore it or
  update them.
- ⬜ `.mcp.json` is missing, so the `drawio` server `AGENTS.md` describes isn't registered: add it or update the text.
- ⬜ `pr-review.md` still mentions `.bruno/`: remove the mention and run `gh aw compile pr-review`.
- ⬜ `worklog` is marked ported in the manifest but has no folder (it comes from the missing `shared/` tier):
  restore the tier or set `ported: false`.

---

## Decisions

Newest first. Details in each skill's `CHANGELOG.md` and the commit.

| Date | Decision |
| --- | --- |
| 2026-11-02 | The product copies PPSB's `src/core` and runs it on `TokenDataverseClient`; tokens come from Entra ID through `fetch`, not `@azure/identity`, to keep the bundles free of dependencies (ADR-0010) |
| 2026-11-03 | The docs site is VitePress, pinned to 2.0.0-alpha.18, in `github-pages/` and deployed to GitHub Pages; ADRs stay in `docs/decisions/` and the site links to them |
| 2026-11-03 | The packages need Node.js 22 or later; the Azure DevOps task declares the `Node24` runner, because Azure Pipelines has no Node.js 22 runner |
| 2026-11-02 | Removed the inherited template docs (ADRs other than ADR-0008, `docs/onboarding/`, `docs/review-logs/`): they described a template this repo doesn't use and internal sources, in a public repo |
| 2026-11-02 | This plan tracks solution-blueprint-ci; blog content and channel tasks are out of scope here |
| 2026-11-02 | Removed the blog, SEO, image, readability, social, analytics and Bruno skills, the `aidevme-context` agent and the `seo-audit`, `media-audit` and `bruno-media` workflows; older decisions about them below are history |
| 2026-11-01 | Pull request review runs as a GitHub Agentic Workflow with a read-only agent; it may only comment, never approve or block, and checks changes against `AGENTS.md` |
| 2026-10-27 | The Bruno collection for aidevme.com is GET-only, in OpenCollection YAML, with credentials only through `process.env`; `check_collection.py` enforces it |
| 2026-10-27 | draw.io diagrams use jgraph's local `@drawio/mcp` server (not the hosted App Server, which sends diagrams to mcp.draw.io), libavoid edge routing as a safety net, and exports with the diagram XML embedded |
| 2026-10-26 | An image counts as optimized when a WebP or AVIF attachment with the same base file name exists; the media audit runs weekly as an agentic workflow on `aidevme-image`'s script |
| 2026-10-26 | The SEO audit runs every Monday at 01:00 Europe/Berlin (cron with `timezone`), not at gh-aw's scattered time |
| 2026-10-26 | `AGENTS.md` describes this blog repo; the template's Dataverse, Solutions and worktree-per-ticket rules no longer apply |
| 2026-10-25 | Substack and LinkedIn newsletter editions are adapted versions linking to aidevme.com, because neither has a canonical URL setting |
| 2026-10-25 | Tag changes go retrieve → analyze → plan → apply, and only Zsolt applies them |
| 2026-10-24 | `CHANGELOG.md` is a skill's only history; `check-changelogs.ps1` gates every skill change |
| 2026-10-24 | Image entries carry caption, prompt link, GitHub URL and Azure Blob Storage URL; diagrams are rendered, never generated |
| 2026-10-23 | A draft is ready when every measured Yoast readability check is green |
| 2026-10-23 | The SEO audit runs as a GitHub Agentic Workflow with a read-only agent and a single safe-output issue |
| 2026-10-22 | Commits are attributed to Zsolt Zombik, with no AI co-author lines |

Architecture decisions are in `docs/decisions/`: ADR-0008, the sync mechanism, is the one kept from the template, and
ADR-0010 covers the PPSB core and the Dataverse client.
