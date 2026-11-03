# Prerequisites

1. **An Entra ID app registration** (service principal).
2. **An application user** for that service principal in each Dataverse environment you document, created in the
   Power Platform admin center.
3. **A security role** for the application user with read access to metadata and solution components. Write access
   is never required.
4. **Node.js 22 or later** (for the CLI). The Azure DevOps task runs on the agent's Node.js 24 runner.

Every run needs at least one solution, identified by its **unique name**, not its display name.

::: tip Keep client data out
Generated blueprints describe your environment. Treat the output like any other internal document, and don't commit
it to a public repository.
:::
