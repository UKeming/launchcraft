# LaunchCraft

Claude Code plugin: end-to-end product development pipeline via skills, MCP, agents, and memory.

## Pipeline

spark → scope-planning → user-story → design-doc → tdd-testing → impl → test-report → launch

## Repo Structure

- `skills/` — 9 skills (spark, scope-planning, user-story, design-doc, tdd-testing, impl, test-report, launch, debugging)
- `agents/` — contract-validator (independent output verification)
- `commands/` — slash commands delegating to skills
- `hooks/` — SessionStart hook (pipeline stage detection + auto-memory)
- `docs/contracts.md` — input/output contracts for all skills

## GitHub

- Repo: UKeming/launchcraft (public)
- Push requires `gh auth setup-git` after switching accounts

## Gotchas

### Git/GitHub
- **Account switching breaks push**: `gh auth switch` changes the CLI account but git push still uses old credentials. MUST run `gh auth setup-git --hostname github.com` after switching.
- **Empty repo can't use `--push`**: `gh repo create --push` fails with no commits. Create at least one commit first.

### Plugin Design
- **Self-validation is unreliable**: Don't trust a skill to check its own output. Always use an independent agent (contract-validator) for verification.
- **Don't duplicate hook instructions in skills**: If the hook injects global instructions (like auto-memory), adding the same to each skill is redundant and bloats context. Keep skills focused on their domain.
- **Rationalization tables must be skill-specific**: Generic "don't skip steps" doesn't work. Each skill needs its own table targeting the specific shortcuts agents try for that stage.
- **Evidence gates need concrete checkboxes**: Vague "verify before completing" gets ignored. Each skill needs explicit "show this output" requirements.

### Contract System
- **Contracts are the single source of truth**: Validation rules live in `docs/contracts.md`, not scattered across skills. The contract-validator agent reads from there.
- **Upstream failures cascade**: If user-story output is bad, every downstream skill fails. The contract-validator catches this at the boundary, but fixing means re-running upstream — not patching downstream.

### Hooks
- **SessionStart hook runs test suites**: The pipeline stage detection actually runs `npm test` / `pytest` etc. This can be slow on large projects. Keep it best-effort with timeouts.
- **Hook output is JSON**: Must escape special characters properly. The `escape_for_json` helper handles newlines, quotes, backslashes.
- **Cross-platform wrapper is required**: `run-hook.cmd` polyglot ensures hooks work on Windows (batch) and Unix (bash).
