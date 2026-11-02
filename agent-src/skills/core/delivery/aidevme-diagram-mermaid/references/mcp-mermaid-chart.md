# Mermaid Chart MCP Server and fallbacks

<!-- cspell:ignore mmdc kroki rtuin hustcc mcpServers -->

Docs: <https://mermaid.ai/docs/ai/mcp-server> · Claude MCP App: <https://mermaid.ai/docs/ai/mcp-apps-server>

## 1. Mermaid Chart MCP Server (primary)

| Transport | URL | Config `type` |
| --- | --- | --- |
| Streamable HTTP | `https://mcp.mermaid.ai/mcp` | `"http"` |
| SSE | `https://mcp.mermaid.ai/sse` | `"sse"` |
| Legacy registry listing | `https://mcp.mermaidchart.com/mcp` | `"http"` |

### Auth

Every tool call needs a Mermaid account (the free Basic tier is enough). Without valid auth, every call is rejected.

- **Preferred: OAuth 2.1 with Dynamic Client Registration.** No headers in the config; the client opens a
  browser login on the first call.
- **Fallback:** an `Authorization: <token>` header in the client's MCP config. The user adds it themselves —
  the agent never asks for the token in chat, never writes it to a file, and never prints it.

### Tools

| Tool | Purpose | Side effects |
| --- | --- | --- |
| `validate_and_render_mermaid_diagram` | Validate syntax; return PNG/SVG + Mermaid Live edit link | none |
| `get_diagram_title` | Generate a descriptive title | none |
| `get_diagram_summary` | Generate a concise summary (→ `accDescr`, caption) | none |
| `list_tools` | List server tools | none |
| `list_mermaid_chart_projects` | List projects in the user's account | none |
| `list_mermaid_chart_diagrams` | List diagrams in a project | none |
| `get_mermaid_chart_diagram` | Fetch an existing diagram | none |
| `create_mermaid_chart_diagram` | Save a new diagram to a project | **writes — confirm first** |
| `update_mermaid_chart_diagram` | Update an existing diagram | **writes — confirm first** |

**Read each tool's input schema before calling.** Do not assume parameter names.

### Save-to-project procedure

1. `list_mermaid_chart_projects` → show the projects.
2. Ask: which project, create new vs update existing (if updating, `list_mermaid_chart_diagrams` and let the user pick).
3. Check the code for confidential names; offer to anonymise.
4. Show a one-line summary: *"Create diagram '{title}' in project '{project}'?"* — proceed only on "yes".
5. Call `create_mermaid_chart_diagram` / `update_mermaid_chart_diagram`; report the returned link.

## 2. Mermaid Claude MCP App (claude.ai)

- URL: `https://chatgpt.mermaid.ai/anthropic/mcp`
- One tool: `validate_and_render_mermaid_diagram(diagramCode, title?)` — note **`diagramCode`**.
- Returns `valid`, `diagramType`, `renderedSVG`, `renderedPNG`, `liveEditUrl`, `validationError`; shows an
  interactive widget with copy button and repair link. Read-only.
- No project tools: saving to Mermaid Chart needs the full MCP server.

## 3. Client configuration

### Claude Code

```bash
claude mcp add --transport http mermaid https://mcp.mermaid.ai/mcp
```

Or in `.mcp.json` (project) / `~/.claude.json` (user):

```json
{
  "mcpServers": {
    "mermaid": { "type": "http", "url": "https://mcp.mermaid.ai/mcp" }
  }
}
```

### VS Code (`.vscode/mcp.json` — key is `servers`)

```json
{
  "servers": {
    "mermaid": { "type": "http", "url": "https://mcp.mermaid.ai/mcp" }
  }
}
```

### Cursor (`~/.cursor/mcp.json` — key is `mcpServers`)

```json
{
  "mcpServers": {
    "mermaid": { "url": "https://mcp.mermaid.ai/mcp" }
  }
}
```

### Clients without remote-HTTP support (for example Antigravity)

```json
{
  "mcpServers": {
    "mermaid": { "command": "npx", "args": ["-y", "mcp-remote", "https://mcp.mermaid.ai/mcp"] }
  }
}
```

Header fallback (user edits their own config; never commit it): add
`"headers": { "Authorization": "<token>" }` to the server entry.

## 4. Fallback backends (in order)

| # | Backend | How | Notes |
| --- | --- | --- | --- |
| 1 | Community MCP already configured | `@rtuin/mcp-mermaid-validator` → `validateMermaid` (stdio, PNG); `hustcc/mcp-mermaid` → theme/background, PNG/SVG/base64; `mermaid-lint-mcp` → `validate_mermaid_diagram` | Use only if already present; don't install servers unasked |
| 2 | Local `mmdc` | `npm i -g @mermaid-js/mermaid-cli` → `mmdc -i diagram.mmd -o diagram.svg` | Offline, full theme control; needs a Chromium. If the bundled download was skipped or a desktop browser won't launch headless ("Failed to launch the browser process: Code: 0"), install `npx @puppeteer/browsers install chrome-headless-shell@stable` and point `PUPPETEER_EXECUTABLE_PATH` at it |
| 3 | Kroki | `curl -X POST -H "Content-Type: text/plain" --data-binary @diagram.mmd https://kroki.io/mermaid/svg` | Zero install; **public service** — anonymise confidential content first |
| 4 | None | Code + Mermaid Live link (`https://mermaid.live/`) | Must say *not validated* |

`scripts/validate_local.sh` wraps 2 → 3 and returns exit code 0 (valid) / 1 (invalid, error on stderr) /
2 (no backend).

## 5. Error handling

| Symptom | Meaning | Action |
| --- | --- | --- |
| 401 / "unauthorized" / "authentication required" | No or expired Mermaid login | Ask the user to complete the OAuth sign-in or configure the header; fall back meanwhile |
| `valid: false` + `validationError` | Syntax error | Fix the cited line; max 3 attempts |
| Unknown diagram type | Renderer older than the syntax, or beta type | Fall back to a stable type (`flowchart`) |
| Timeout / 5xx | Service issue | Retry once, then next backend |
| Tool missing from schema | Server variant differs | Use what `list_tools` reports; never call a tool that isn't listed |
