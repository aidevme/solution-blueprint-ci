# stateDiagram-v2

Use for record lifecycles (statecode/statuscode), BPF stages, approval states.

```mermaid
stateDiagram-v2
  accTitle: Order lifecycle
  accDescr: An order moves from draft to submitted to fulfilled, and can be cancelled before fulfilment.
  [*] --> Draft
  Draft --> Submitted : submit
  Submitted --> Fulfilled : ship
  Draft --> Cancelled : cancel
  Submitted --> Cancelled : cancel
  Fulfilled --> [*]
  Cancelled --> [*]
  note right of Submitted : Awaiting warehouse
```

- Composite: `state Active { [*] --> InProgress }` — one per statecode, statuscodes inside.
- Spaces in names: `state "On Hold" as OnHold`.
