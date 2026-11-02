# flowchart

Use for steps, decisions and branches (Power Automate, Logic Apps, approval processes, ALM).
`TD` for hierarchies and decision trees; `LR` for pipelines and long chains.

```mermaid
flowchart TD
  accTitle: Approval flow
  accDescr: A request is submitted, validated, and either approved or returned to the requester.
  start(["Request submitted"]) --> check{"Amount > 10k?"}
  check -- Yes --> mgr["Manager approval"]
  check -- No --> auto["Auto-approve"]
  mgr --> done(["Approved"])
  auto --> done
  subgraph sgNotify["Notifications"]
    mail["Email requester"]
  end
  done --> mail
```

- Shapes: `["rect"]`, `("rounded")`, `(["stadium"])`, `{"decision"}`, `[("database")]`, `[["subroutine"]]`,
  `(("circle"))`.
- Edge labels: `A -- text --> B` or `A -->|text| B`. Dotted `-.->`, thick `==>`.
- Never use bare `end` as an ID.
