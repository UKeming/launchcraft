# LaunchCraft

Claude Code plugin: end-to-end product development pipeline via skills, MCP, agents, and memory.

## Pipeline

spark → research → differentiation → enhance → differentiation (re-run) → accountant (pre-planning) → user-story → design-doc → frontend-design → tdd-testing → impl → test-report → launch → accountant (post-launch)

### Agents dispatched during pipeline:
- **contract-validator** — after every skill, validates output against contracts
- **accountant** — after 2nd differentiation (pre-planning: go/no-go) and after launch (post-launch: detailed financial report)
- **code-reviewer** — after tdd-testing and impl, reviews code quality and auto-fixes
- **frontend-tester** — after frontend-design, tests every page with Playwright

## Repo Structure

- `skills/` — 13 skills (spark, research, differentiation, enhance, user-story, design-doc, frontend-design, tdd-testing, impl, test-report, launch, debugging)
- `agents/` — contract-validator, accountant, code-reviewer, frontend-tester
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
- **Stop hook needs cooldown**: The pipeline-advance stop hook fires on EVERY stop attempt. Without a cooldown, it creates an infinite loop when the agent can't immediately advance (e.g., waiting for background agents). Fixed by writing `.launchcraft-advance-state` with the last directive — same directive within 5 minutes is suppressed.
