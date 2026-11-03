---
adr: 0010
title: Copy the PPSB core and run it on a token-based Dataverse client
status: accepted
date: 2026-11-02
author: Zsolt Zombik
supersedes: []
---

# ADR-0010 — Copy the PPSB core and run it on a token-based Dataverse client

## Context

solution-blueprint-ci reuses the discovery, analysis and reporting logic of Power Platform Solution Blueprint (PPSB),
which is MIT licensed. PPSB runs inside PPTB Desktop. Its logic is in `src/core` and reaches Dataverse only through
the four methods of `IDataverseClient`; `PptbDataverseClient` implements them with the PPTB Desktop API.

PPSB publishes one npm package, which depends on React and Fluent UI. There's no separate core package.

Our published packages support Node.js 22 and later. The GitHub Action commits its bundle, and the Azure DevOps task
ships one.

## Options considered

1. **Depend on the PPSB npm package** — Pros: updates arrive through npm. Cons: brings in the UI dependencies, and
   it doesn't publish the core as a separate entry point.
2. **Copy `src/core` into `packages/core`** — Pros: no UI dependencies, and it can change for headless use. Cons:
   we merge upstream fixes by hand.
3. **Rewrite the logic** — Pros: full control. Cons: repeats about 170 files of tested Dataverse knowledge.

For authentication:

1. **`@azure/identity`** — Pros: maintained, and supports sovereign clouds. Cons: adds a dozen dependencies to
   the bundles.
2. **Call the Entra ID token endpoint with `fetch`** — Pros: no dependencies. Cons: we own a small amount of
   authentication code, and only the public cloud works for now.

## Decision

Copy `src/core` from PPSB into `packages/core`, keeping `IDataverseClient.ts` unchanged, and implement that interface
with `TokenDataverseClient`. Request tokens with `fetch`, using a client secret or a federated token.

The copy starts from PPSB commit `9402e8275cf1fa5a4d1bc14a6d8eaef7c7e1d81a` (v1.5.0). `LICENSE` in the core and CLI
packages keeps the original copyright notice.

## Rationale

`IDataverseClient` is already the boundary our design needs, so the copied logic can stay close to upstream, which
keeps later merges practical.

`TokenDataverseClient` differs from `PptbDataverseClient` where a headless run needs it to:

- It retries 429 and 5xx responses and honours `Retry-After`, which Dataverse sends when service protection limits
  apply.
- It refuses an `@odata.nextLink` on another host, so the token can't leave the environment.
- It requires https, and URL-encodes query values.
- It asks for all annotations, because the discovery code reads formatted values.

## Consequences

- Upstream fixes are merged by hand, starting from the commit above.
- The core gets one Dataverse boundary to fake in tests.
- Sovereign clouds need a configurable authority, or a move to `@azure/identity`.
- Token requests aren't retried yet, so a network failure at that step fails the run.
- The GitHub Action needs to obtain its OIDC token and pass it as `getFederatedToken`; the Azure DevOps task needs
  to read the same values from its service connection.
