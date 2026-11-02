# aidevme-diagram-mermaid

<!-- cspell:ignore mmdc kroki mcpServers -->

An [Agent Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) from
[AIDevMe](https://aidevme.com) that turns requests, code or architecture descriptions into **valid, readable,
accessible Mermaid diagrams**. It validates and renders every diagram through the
[Mermaid Chart MCP Server](https://mermaid.ai/docs/ai/mcp-server) before delivering it, and falls back to the
local Mermaid CLI or Kroki when the server isn't available.

Tuned for Power Platform and Dynamics 365 CE work (Dataverse schemas, plugin pipelines, record lifecycles,
Power Automate flows, Copilot Studio agents, ALM), but works for any software or business diagram.

## What it does

- Picks the right diagram type (ER, sequence, state, flowchart, C4, Gantt, mind map and more).
- Writes Mermaid v11 that avoids the common parse traps (reserved `end`, unquoted parentheses, `o`/`x` edges).
- Validates before delivery: up to 3 fix attempts, then a visual check of the render (up to 2 fix rounds).
- Adds `accTitle` / `accDescr` and a text alternative; uses a restrained, contrast-checked palette.
- Delivers a ```` ```mermaid ```` block, a `.mmd` file, PNG/SVG, or saves to a Mermaid Chart project — only after
  you confirm.

## Install

**Claude Code** — copy the folder into your skills directory:

```bash
# personal (all projects)
cp -r aidevme-diagram-mermaid ~/.claude/skills/
# or project-only
cp -r aidevme-diagram-mermaid .claude/skills/
```

**claude.ai** — zip the folder, then upload it under **Settings → Capabilities → Skills**.

## Connect the Mermaid Chart MCP Server

Every tool call needs a Mermaid account; the free tier is enough. Sign-in uses OAuth in the browser on first use,
so no token goes in the config.

**Claude Code**

```bash
claude mcp add --transport http mermaid https://mcp.mermaid.ai/mcp
```

**VS Code** — `.vscode/mcp.json`

```json
{
  "servers": {
    "mermaid": { "type": "http", "url": "https://mcp.mermaid.ai/mcp" }
  }
}
```

**Cursor** — `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "mermaid": { "url": "https://mcp.mermaid.ai/mcp" }
  }
}
```

On claude.ai you can instead add the Mermaid Claude MCP App (`https://chatgpt.mermaid.ai/anthropic/mcp`) for
validation and interactive rendering. Full details: <https://mermaid.ai/docs/ai/mcp-server>.

## Offline fallback

```bash
npm i -g @mermaid-js/mermaid-cli
bash scripts/validate_local.sh diagram.mmd --out diagram.svg      # mmdc, then Kroki
python scripts/extract_mermaid.py docs/ --validate                # every ```mermaid block in docs/
```

If `mmdc` can't start a browser, install a headless one and point Puppeteer at it:

```bash
npx @puppeteer/browsers install chrome-headless-shell@stable
export PUPPETEER_EXECUTABLE_PATH=/path/to/chrome-headless-shell
```

Kroki is a public service — don't send confidential diagrams to it.

## Contents

| Path | Purpose |
| --- | --- |
| `SKILL.md` | Workflow, guardrails, verification |
| `references/` | MCP server, diagram selection, syntax pitfalls, styling, accessibility |
| `references/types/` | One validated template per diagram type (14) |
| `examples/` | Validated Power Platform samples (ERD, plugin pipeline, C4, case lifecycle, ALM) |
| `scripts/` | `validate_local.sh` (mmdc → Kroki), `extract_mermaid.py` (batch-validate Markdown) |
| `evals/evals.json` | Trigger and behaviour test prompts |

## Branding

`references/styling-and-branding.md` holds placeholder tokens (`{{AIDEVME_PRIMARY}}` …) with neutral,
WCAG-AA defaults. Fill in the brand colours and re-check contrast.
