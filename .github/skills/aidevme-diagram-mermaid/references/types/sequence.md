# sequenceDiagram

Use for calls over time: plugin pipelines, API integrations, PCF lifecycle, one Copilot Studio conversation.

```mermaid
sequenceDiagram
  accTitle: Token-authenticated API call
  accDescr: A client gets a token from Entra ID, calls the API, and retries once on throttling.
  autonumber
  participant C as Client
  participant E as Entra ID
  participant A as API
  C->>+E: Request token
  E-->>-C: Access token
  C->>+A: GET /accounts
  alt 429 throttled
    A-->>C: Retry-After
    C->>A: Retry
  else success
    A-->>C: 200 OK
  end
  deactivate A
```

- Arrows: `->>` sync, `-->>` reply, `-)` async, `-x` failure.
- Blocks `alt/else`, `opt`, `loop`, `par/and`, `critical/option`, `break` — each ends with `end`.
- `activate`/`deactivate` (or `+`/`-`) must balance.
