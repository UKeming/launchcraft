# LaunchCraft

A Claude Code plugin that turns ideas into launched products through a structured pipeline.

## Pipeline

```
/spark → /research → /differentiation → /scope-planning → /user-story → /design-doc → /tdd-testing → /impl → /test-report → /launch
```

Each stage validates its input from the previous stage, produces verified output, and saves important learnings to project memory (`CLAUDE.md`).

## Install

```bash
claude plugin marketplace add UKeming/launchcraft
claude plugin install launchcraft
```

Restart Claude Code after installing.

## Usage

Start a new Claude Code session in your project directory. The plugin auto-detects your pipeline stage and tells you what to do next.

### Slash Commands

| Command | What it does |
|---------|-------------|
| `/spark` | Capture, analyze, and structure requirements with competitive analysis and success criteria |
| `/research` | Validate requirements against real market data, user pain points, and technical landscape |
| `/differentiation` | Define product positioning, strategic bets, and competitive advantage |
| `/scope-planning` | Analyze complexity, determine story count, plan design doc breakdown and impl modules |
| `/user-story` | Generate comprehensive user stories per scope plan, covering full user journeys |
| `/design-doc` | Create a technical design document from user stories |
| `/tdd-testing` | Write failing tests from the design (TDD red phase) |
| `/impl` | Implement code to make tests pass (TDD green phase) |
| `/test-report` | Generate test report with metrics and coverage |
| `/launch` | Deploy to Cloudflare and assign `appX.keming.co` subdomain |
| `/debug` | Systematic debugging when any pipeline stage fails |

### Example

```
You: I want to build a bookmark manager app

Claude: [auto-detects: no pipeline artifacts → suggests /spark]

You: /spark

Claude: [probing questions → competitive analysis → structured requirements → saves to .launchcraft/requirements/ → contract-validator verifies]

You: /research

Claude: [web search → market data → competitor deep-dive → assumption validation → product-market fit assessment → saves to .launchcraft/research/ → contract-validator verifies]

You: /differentiation

Claude: [feature matrix → differentiation axes → positioning statement → strategic bets → requirement adjustments → saves to .launchcraft/strategy/ → contract-validator verifies]

You: /scope-planning

Claude: [analyzes complexity → calculates story count → plans design doc split → defines impl modules → saves scope plan → contract-validator verifies]

You: /user-story

Claude: [asks clarifying questions → identifies personas → generates user stories → saves per-domain story files (.launchcraft/[domain]/stories/US-NNN.md) → contract-validator verifies]

You: /design-doc

Claude: [reads domain stories → proposes architecture → writes design per domain (.launchcraft/[domain]/design.md) → contract-validator verifies]

...continue through the pipeline...
```

## Quality Guarantees

- **Contract validation** — An independent agent verifies every stage's output against defined contracts (`docs/contracts.md`)
- **HARD-GATEs** — Each skill enforces prerequisites before proceeding (e.g., must ask clarifying questions before generating user stories)
- **Evidence gates** — Must show concrete proof (command output, file paths, test results) before claiming completion
- **Rationalization prevention** — Each skill has defenses against common shortcuts agents try to take
- **Auto-memory** — Important decisions, gotchas, and configuration are saved to `CLAUDE.md` automatically

## Project Structure

```
launchcraft/
├── .claude-plugin/
│   ├── plugin.json               # Plugin manifest
│   └── marketplace.json          # Marketplace catalog
├── skills/                       # Pipeline skills
│   ├── spark/SKILL.md
│   ├── research/SKILL.md
│   ├── differentiation/SKILL.md
│   ├── scope-planning/SKILL.md
│   ├── user-story/SKILL.md
│   ├── design-doc/SKILL.md
│   ├── tdd-testing/SKILL.md
│   ├── impl/SKILL.md
│   ├── test-report/SKILL.md
│   ├── launch/SKILL.md
│   └── debugging/SKILL.md
├── agents/
│   └── contract-validator.md     # Independent output verifier
├── commands/                     # Slash command shortcuts
├── hooks/                        # SessionStart: stage detection + memory injection
└── .launchcraft/
    ├── contracts.md              # Input/output contracts for all skills
    └── worktree-guide.md         # Isolated workspaces per product
```

## How It Works

1. **SessionStart hook** runs on every session — detects which pipeline stage you're in by checking for artifacts (`.launchcraft/*/stories/`, `.launchcraft/*/design.md`, `tests/`, etc.) and injects context
2. **Each skill** validates its input contract, enforces a HARD-GATE before doing real work, then produces output
3. **Contract-validator agent** independently checks the output against `docs/contracts.md`
4. **Auto-memory** saves key decisions and gotchas to `CLAUDE.md` so future sessions have full context

## License

MIT
