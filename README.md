# LaunchCraft

A Claude Code plugin that turns ideas into launched, production-grade products through a fully automated pipeline. Not prototypes — real products with 50+ features, 15+ pages, real data, and real API integrations.

## Pipeline

```
/spark → PM review → /research → PM review → /differentiation → PM review → /enhance → PM review
  → /user-story → PM review → /design-doc → PM review → /frontend-design → PM review
  → /tdd-testing → PM review → /impl → PM review → /experience-review → PM review
  → /test-report → PM review → /launch
```

The entire pipeline auto-runs from `/spark` to launch. After each stage, a PM (product-manager) agent reviews the output and decides whether to PROCEED or ROLLBACK. Each stage validates its input, produces verified output, and automatically invokes the next stage. The only time the pipeline stops is during spark (to ask you about your idea) and launch (to collect your real API keys).

## Install

```bash
claude plugin marketplace add UKeming/launchcraft
claude plugin install launchcraft
```

Restart Claude Code after installing.

## Usage

Start a new Claude Code session in your project directory:

```
You: I want to build a bookmark manager app

You: /spark
```

That's it. The pipeline runs automatically from spark through launch, producing:

1. **Spark** — structured requirements with competitive analysis, business model, 50+ features
2. **Research** — market validation, competitor feature counts, UI screenshots of competitor apps
3. **Differentiation** — positioning strategy, strategic bets, feature matrix
4. **Enhance** — expands to 35-70+ features based on competitor benchmarks
5. **User Story** — individual story files (1 file per story, 5+ acceptance criteria each), organized by domain
6. **Design Doc** — 1 design doc per story (200+ lines each), system architecture + API contract
7. **Frontend Design** — 12-18+ pages, bold aesthetic, responsive, with competitor UI as reference
8. **TDD Testing** — failing tests for every story (red phase)
9. **Implementation** — code to pass all tests (green phase), parallel by component
10. **Experience Review** — Playwright-based QA with 2+ iteration passes, visual design audit, P0/P1/P2 improvement suggestions
11. **Test Report** — full traceability matrix from requirements to test results
12. **Launch** — real data audit (no mock data), API key collection, deploy to Cloudflare

## Anti-Laziness System

LLMs produce thin output when asked to generate many files. LaunchCraft fights this with:

- **1 story = 1 design doc** — each agent designs ONE story with full attention
- **Max 8-10 stories per agent** — prevents context fatigue
- **Minimum depth requirements** — 5+ acceptance criteria per story, 200+ lines per design doc
- **Gold standard examples** — agents read exemplary files before writing
- **Depth-validator agent** — checks every file for minimum depth, rejects thin batches
- **Ultrathink triggers** — "Write each story as if it's the ONLY one you're writing today"

## Enforcement Hooks

Instructions alone don't work — hooks enforce behavior deterministically:

| Hook | Event | Enforcement |
|------|-------|-------------|
| `enforce-paths` | PreToolUse (Write/Edit) | Blocks pipeline .md files outside `.launchcraft/`. Blocks flat structures. |
| `pipeline-advance` | Stop | Blocks agent from stopping between stages. Injects next skill command. |
| `session-start` | SessionStart | Detects pipeline stage, injects context. |

## Sub-Agents

Parallel work is done by dedicated sub-agents, each with focused scope:

| Agent | When | What it does |
|-------|------|-------------|
| `user-story-writer` | user-story | Writes 8-10 story files per batch, worktree isolation |
| `design-doc-writer` | design-doc | Designs 1 story, has nano-banana MCP for images |
| `tdd-test-writer` | tdd-testing | Writes tests for 1 domain |
| `impl-worker` | impl | Implements 1 component per dependency layer |
| `experience-reviewer` | experience-review | Playwright QA, 2+ passes, fixes inline |
| `contract-validator` | every stage | Validates output against `docs/contracts.md` |
| `depth-validator` | user-story, design-doc | Checks per-file depth (criteria count, line count) |
| `code-reviewer` | tdd-testing, impl | Code quality, auto-fixes |
| `frontend-tester` | frontend-design | Playwright visual testing |
| `accountant` | pre-planning, post-launch | Business viability, financial projections |

## Output Structure

All pipeline artifacts go to `.launchcraft/` (never `docs/`):

```
.launchcraft/
  requirements/                          # spark
  research/                              # research + competitor screenshots
    screenshots/[competitor]/
  strategy/                              # differentiation
  enhanced/                              # enhance
  stories/                               # user stories (1 file per story)
    auth/US-001-login.md
    dashboard/US-010-view.md
  designs/                               # design docs (1 per story)
    system/design.md                     # global architecture
    US-001-user-login/design.md
    US-010-dashboard-view/design.md
  api-contract.yaml                      # OpenAPI 3.0 (single source of truth)
  user-stories-index.md
  story-coverage.md
  frontend-design/
  test-plans/
  test-reports/
  experience-review/
  launches/
  financials/
  pipeline-context.md
```

## Real Data Policy

No mock data, no placeholder API keys, no lorem ipsum. Ever.

- During **impl**: if the app needs an API key, the agent asks you via `AskUserQuestion`
- During **launch**: full data audit scans for mock URLs, test keys, placeholder content
- Every external service connection is verified before deploy

## How It Works

1. **SessionStart hook** detects pipeline stage from `.launchcraft/` artifacts
2. **Each skill** validates input, enforces HARD-GATE, produces output, writes `.launchcraft/.pipeline-next`
3. **Stop hook** reads the state file and blocks stop — injects next skill command
4. **enforce-paths hook** blocks any Write/Edit to wrong paths (deterministic enforcement)
5. **Sub-agents** do parallel work in isolated worktrees, merged after completion
6. **Contract-validator + depth-validator** verify both structure and quality
7. **Auto-memory** saves decisions and gotchas to `CLAUDE.md`

## License

MIT
