# Agent skills

## Issue tracker

For issue and project work, use GitHub through `gh`; read [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md).

## Domain docs

Before domain changes, read [docs/agents/domain.md](docs/agents/domain.md).

## Engineering

Keep the catalog model, case of use, SQL adapter and React presenter separate. Public report responses use an explicit allowlist and exclude private contact and storage data. Ownership requires verified identity; a display name is presentation only.

Run database mutation and integration scripts only against isolated local development/test databases. Preserve unrelated working-tree changes and keep credentials in ignored environment files.
