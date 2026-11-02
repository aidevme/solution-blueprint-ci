# Security policy

## Reporting a vulnerability

Please don't report security vulnerabilities in public issues, discussions or pull requests.

Report them privately through [GitHub private vulnerability reporting](https://github.com/aidevme/solution-blueprint-ci/security/advisories/new). Include what you found, how to reproduce it and which package and version it affects. Don't include real credentials or client data.

## Supported versions

This project is in early development and has no released versions yet. Once releases begin, security fixes go to the latest release.

## If a credential is exposed

If a client secret, token or similar credential appears in a log, an issue or a generated blueprint, treat it as compromised. Rotate it in Microsoft Entra ID first, then report how it was exposed using the private route above.
