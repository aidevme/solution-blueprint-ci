# classDiagram

Use for code structure: plugin/service/repository layers, early-bound types, PCF component classes.

```mermaid
classDiagram
  accTitle: Plugin layering
  accDescr: A plugin depends on a service, which depends on a generic repository interface.
  class IRepository~T~ {
    <<interface>>
    +Get(id) T
    +Update(entity) void
  }
  class AccountService {
    -IRepository~Account~ repo
    +Recalculate(id) void
  }
  class AccountPlugin {
    +Execute(provider) void
  }
  AccountPlugin --> AccountService : uses
  AccountService --> IRepository : depends on
```

- Generics `~T~`; visibility `+ - # ~`; static `$`, abstract `*`.
- Annotations `<<interface>>`, `<<abstract>>`, `<<service>>`.
- Refer to a generic class by its bare name in relationships (`IRepository`, not `IRepository~T~`).
