# erDiagram

Use for Dataverse tables and relationships. Entity IDs = logical names; attribute types without spaces.

```mermaid
erDiagram
  accTitle: Account and contacts
  accDescr: An account has many contacts; each contact may be the primary contact of an account.
  account ||--o{ contact : "parent of"
  contact |o--o| account : "primary contact"
  account {
    uniqueidentifier accountid PK
    string name
    uniqueidentifier primarycontactid FK
  }
  contact {
    uniqueidentifier contactid PK
    string fullname
    uniqueidentifier parentcustomerid FK
  }
```

- Cardinality: `||` one, `|o` zero/one, `}|` one+, `}o` zero+.
- N:N: draw the intersect table with two 1:N, or `}o--o{` labelled `"N:N"`.
- Keys `PK`, `FK`, `UK`; comments in quotes after the key.
