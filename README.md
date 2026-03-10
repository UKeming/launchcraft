# LaunchCraft

A Claude Code plugin that turns ideas into launched products through a structured pipeline.

## Pipeline

```
/user-story → /design-doc → /tdd-testing → /impl → /test-report → /launch
```

Each stage validates its input from the previous stage, produces verified output, and saves important learnings to project memory (`CLAUDE.md`).

## Install

```bash
claude plugin add UKeming/launchcraft
```

## Usage

Start a new Claude Code session in your project directory. The plugin auto-detects your pipeline stage and tells you what to do next.

### Slash Commands

| Command | What it does |
|---------|-------------|
| `/user-story` | Convert raw needs into structured user stories with personas and acceptance criteria |
| `/design-doc` | Create a technical design document from user stories |
| `/tdd-testing` | Write failing tests from the design (TDD red phase) |
| `/impl` | Implement code to make tests pass (TDD green phase) |
| `/test-report` | Generate test report with metrics and coverage |
| `/launch` | Deploy to Cloudflare and assign `appX.keming.co` subdomain |
| `/debug` | Systematic debugging when any pipeline stage fails |

### Inputting Requirements

The pipeline starts with a raw need. You can provide it in any form:

```
# Direct description
You: /user-story
Claude: What need are we addressing?
You: Users can't find the search bar on mobile

# Paste user feedback
You: /user-story
Claude: What need are we addressing?
You: Here are 3 support tickets about our checkout flow: [paste]

# Idea from scratch
You: /user-story
Claude: What need are we addressing?
You: I want to build a habit tracker app
```

The skill will ask clarifying questions to refine the need before generating stories. You don't need a formal spec — a sentence or a pasted complaint is enough.

### Example

```
You: I want to build a bookmark manager app

Claude: [auto-detects: no pipeline artifacts → suggests /user-story]

You: /user-story

Claude: [asks clarifying questions → identifies personas → generates user stories → saves to docs/user-stories/ → contract-validator verifies]

You: /design-doc

Claude: [reads user stories → proposes architecture options → writes design → saves to docs/designs/ → contract-validator verifies]

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
├── .claude-plugin/plugin.json    # Plugin manifest
├── skills/                       # Pipeline skills
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
└── docs/
    ├── contracts.md              # Input/output contracts for all skills
    └── worktree-guide.md         # Isolated workspaces per product
```

## How It Works

1. **SessionStart hook** runs on every session — detects which pipeline stage you're in by checking for artifacts (`docs/user-stories/`, `docs/designs/`, `tests/`, etc.) and injects context
2. **Each skill** validates its input contract, enforces a HARD-GATE before doing real work, then produces output
3. **Contract-validator agent** independently checks the output against `docs/contracts.md`
4. **Auto-memory** saves key decisions and gotchas to `CLAUDE.md` so future sessions have full context

## License

MIT
