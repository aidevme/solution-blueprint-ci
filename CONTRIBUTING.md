# Contributing

Thanks for helping improve solution-blueprint-ci. Issues and pull requests are welcome.

## Before you start

- **Report a bug or request a feature** with the [issue forms](https://github.com/aidevme/solution-blueprint-ci/issues/new/choose).
- **Discuss significant changes first.** Open an issue before you start, so we can agree on the approach.
- **Report security vulnerabilities privately.** Follow [SECURITY.md](SECURITY.md), and don't open a public issue.
- **Keep client data out.** Don't include credentials, tenant IDs, environment URLs, real solution names or client data in issues, tests, logs or examples. Use placeholder names such as `Contoso`.

## Set up

Follow [DEVELOPER.md](DEVELOPER.md) to clone, build and test the project.

## Make a change

1. Branch from `dev`, which is the integration branch.
2. Keep the change focused. Mention unrelated problems separately instead of fixing them in the same pull request.
3. Add or update tests for any behavior you change.
4. Run `pnpm test`, which builds every package and runs the tests.
5. Update `README.md` and the docs site in `github-pages/` if users will notice the change. Preview the site with
   `pnpm docs:dev`, and check it with `pnpm docs:build`, which fails on dead links.

The shared logic belongs in `packages/core`. The CLI, GitHub Action and Azure DevOps task should stay thin: they read inputs and call `core`.

### GitHub Action bundle

The GitHub Action runs from `packages/gh-action/dist/index.js`, so that file is committed. If you change `packages/core` or `packages/gh-action`, run `pnpm build` and commit the updated bundle.

### Repo tooling

Some files are generated, so don't edit them directly:

| Edit this | Generated from it |
| --- | --- |
| `AGENTS.md` | `CLAUDE.md`, `.github/copilot-instructions.md` |
| `agent-src/skills/` | `.claude/skills/`, `.github/skills/` |
| `agent-src/agents/` | `.claude/agents/`, `.github/agents/` |

After changing a source file, run these commands:

```powershell
pwsh -File agent-src/sync/sync.ps1
pwsh -File agent-src/sync/verify-parity.ps1
pwsh -File agent-src/sync/check-changelogs.ps1
```

Every change to a skill also needs an entry in that skill's `CHANGELOG.md`.

## Commit your work

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), with one logical change per commit:

```text
feat(cli): add a format option
fix(core): handle empty solution names
docs: update the usage example
```

## Open a pull request

- Target the `dev` branch.
- Explain what changed and why, and link the related issue.
- Make sure `pnpm test` passes.

Pull requests get an automated review comment. It's advisory only: it never approves or blocks a change.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
