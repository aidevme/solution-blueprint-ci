# Output

```text
blueprint/
├─ README.md                  Summary and navigation
├─ erd.md                     Entity relationship diagram
├─ entities/<table>.md        Schema, forms, views, execution pipeline
├─ automation/                Plugins, flows, workflows, business rules
├─ analysis/                  Cross-entity chains, external dependencies, risks
├─ security/                  Roles, field security, masking rules
├─ blueprint.html             Self-contained interactive report
└─ blueprint.json             Full dataset
```

Choose the formats with `--format` (CLI) or `formats` (GitHub Action and Azure DevOps task): `md`, `html`, `json` and
`zip`.
