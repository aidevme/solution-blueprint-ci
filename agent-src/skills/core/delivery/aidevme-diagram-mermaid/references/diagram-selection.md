# Diagram selection

<!-- cspell:ignore statuscode statecode -->

Pick the type from what the reader needs to understand, not from what is easiest to draw.

## Decision table

| The reader needs to see… | Type | Template |
| --- | --- | --- |
| Steps, decisions, branches | `flowchart TD` / `LR` | [types/flowchart.md](types/flowchart.md) |
| Who calls whom, in what order, over time | `sequenceDiagram` | [types/sequence.md](types/sequence.md) |
| Classes, interfaces, inheritance | `classDiagram` | [types/class.md](types/class.md) |
| Tables / entities and relationships | `erDiagram` | [types/er.md](types/er.md) |
| States and transitions of one thing | `stateDiagram-v2` | [types/state.md](types/state.md) |
| System context / containers for architecture | `C4Context`, `C4Container` | [types/c4.md](types/c4.md) |
| Cloud/service topology with groups | `architecture-beta` | [types/architecture-beta.md](types/architecture-beta.md) |
| Block layout with fixed columns | `block-beta` | [types/block-beta.md](types/block-beta.md) |
| Schedule with dependencies | `gantt` | [types/gantt.md](types/gantt.md) |
| Milestones in order, no durations | `timeline` | [types/timeline.md](types/timeline.md) |
| Ideas branching from one topic | `mindmap` | [types/mindmap.md](types/mindmap.md) |
| User experience across steps, with sentiment | `journey` | [types/journey.md](types/journey.md) |
| Branching / merging history | `gitGraph` | [types/gitgraph.md](types/gitgraph.md) |
| Items placed on two axes | `quadrantChart` | [types/quadrant.md](types/quadrant.md) |

Rules of thumb:
- **Long chains → `LR`; deep hierarchies → `TD`.**
- **One question per diagram.** If the diagram answers two, split it.
- **> ~25 nodes → split** into an overview plus detail views.
- Prefer stable types for GitHub / Azure DevOps wikis; validate beta types and keep a `flowchart` fallback.

## Power Platform / Dynamics 365 patterns

| Scenario | Diagram | Notes |
| --- | --- | --- |
| Dataverse tables, 1:N, N:N | `erDiagram` | Model N:N as two 1:N through the intersect table, or label `}o--o{` "N:N"; logical names as entity IDs, display names in comments/caption |
| Plugin pipeline (PreValidation 10 → PreOperation 20 → MainOperation 30 → PostOperation 40) | `sequenceDiagram` | `alt` for sync failure/rollback, `par` or a separate lane for async (System Job / Async Service) |
| Business Process Flow stages | `stateDiagram-v2` | One state per stage; note required fields per stage |
| Record lifecycle (statecode / statuscode) | `stateDiagram-v2` | Composite state per statecode containing its statuscodes |
| Power Automate / Logic Apps flow | `flowchart TD` | Trigger at top, diamonds for Condition/Switch, subgraph per Scope / Apply to each |
| Copilot Studio agent: topics, actions, MCP / connector calls | `flowchart LR` (structure) or `sequenceDiagram` (one conversation) | Show trigger phrases → topic → action/tool → data source |
| Solution architecture (D365, Azure Functions, Service Bus, APIM, Entra ID) | `C4Container` (stable) or `architecture-beta` | Start at C4Context for executives, C4Container for architects |
| Integration (Dataverse ↔ external system) | `sequenceDiagram` | Include auth (Entra ID token), retries, dead-letter |
| ALM (dev → test → prod, managed solutions) | `flowchart LR` or `gitGraph` | Environments as subgraphs; mark managed vs unmanaged |
| PCF control data flow | `sequenceDiagram` | `init` → `updateView` → `getOutputs` → `notifyOutputChanged` |
| Security model (BU, teams, roles) | `flowchart TD` | Hierarchy; privilege depth in notes, not in nodes |
| Project / migration plan | `gantt` / `timeline` | `gantt` when durations matter, `timeline` when only order matters |
| Workshop ideation, capability map | `mindmap` | ≤ 3 levels deep |
| Prioritisation (effort vs value) | `quadrantChart` | |
