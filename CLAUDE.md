# LaunchCraft

Claude Code plugin: end-to-end product development pipeline via skills, MCP, agents, and memory.

## Pipeline (PM-Driven)

```
spark → PM → research → PM → differentiation → PM → enhance → PM
  → user-story → PM → design-doc → PM → frontend-design → PM
  → tdd-testing → PM → impl → PM → experience-review → PM
  → test-report → PM → launch → accountant (post-launch)
```

The `product-manager` agent reviews after EVERY stage. PM decides PROCEED or ROLLBACK(target-stage). No hardcoded loops — the PM dynamically controls the pipeline flow based on quality/direction/depth evaluation.

### Agents dispatched during pipeline:
- **research-analyst** — parallel per competitor + per research dimension, produces one deep file each (spawned by research skill)
- **user-story-writer** — parallel per domain, writes individual story files (spawned by user-story skill)
- **design-doc-writer** — parallel per feature domain, writes design.md + generates images via nano-banana MCP (spawned by design-doc skill)
- **tdd-test-writer** — parallel per domain, writes failing test files (spawned by tdd-testing skill)
- **impl-worker** — parallel per component layer, implements code to pass tests (spawned by impl skill)
- **experience-reviewer** — foreground agent, uses Playwright to interact with running app, fixes issues, loops until APPROVED. Has project memory.
- **depth-validator** — after user-story and design-doc, checks EVERY file for minimum depth (>= 5 criteria per story, >= 200 lines per design doc)
- **contract-validator** — after every skill, validates output against contracts
- **accountant** — after 2nd differentiation (pre-planning: go/no-go) and after launch (post-launch: detailed financial report)
- **code-reviewer** — after tdd-testing and impl, reviews code quality and auto-fixes
- **frontend-tester** — after frontend-design, tests every page with Playwright

### Pipeline Context Log
- Every skill appends execution summary to `.launchcraft/pipeline-context.md`
- Downstream skills read this file on start to recover full context
- Survives context window compression — the lifeline between sessions

## Repo Structure

- `skills/` — 14 skills (spark, research, differentiation, enhance, user-story, design-doc, frontend-design, tdd-testing, impl, experience-review, test-report, launch, debugging)
- `agents/` — contract-validator, accountant, code-reviewer, frontend-tester
- `commands/` — slash commands delegating to skills
- `hooks/` — SessionStart hook (pipeline stage detection + auto-memory)
- `mcp/` — bundled MCP servers (nano-banana for image generation)
- `docs/contracts.md` — input/output contracts for all skills
- `.mcp.json` — MCP server declarations for the plugin

## Pipeline Doc Structure

Each stage has its own folder. Stories by domain, designs by story (1 story = 1 design doc):

```
.launchcraft/
  requirements/                          # spark output
  research/                              # research output + competitor screenshots
    screenshots/[competitor]/
  strategy/                              # differentiation output
  enhanced/                              # enhance output
  stories/                               # user-story output
    auth/US-001-login.md                 # one file per story
    auth/US-002-register.md
    dashboard/US-010-view.md
  designs/                               # design-doc output
    system/design.md                     # global architecture
    US-001-user-login/design.md          # 1 story = 1 design doc
    US-002-user-register/design.md
    US-010-dashboard-view/design.md
  api-contract.yaml                      # global API contract
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

- **user-story**: stories by domain (`stories/[domain]/US-NNN.md`), max 8-10 per agent
- **design-doc**: 1 design doc per story (`designs/US-NNN-[slug]/design.md`), 1 agent per story
- **tdd-testing** and **impl**: read per-story design docs

## MCP Servers

- **nano-banana** — Image generation/editing via Google Gemini models. Tools: `configure`, `generate_image`, `edit_image`, `list_models`. API key configured via `configure` tool (saved to `~/.config/nano-banana/config.json`) or `GEMINI_API_KEY` env var.

## GitHub

- Repo: UKeming/launchcraft (public)
- Push requires `gh auth setup-git` after switching accounts

## Gotchas

### Plugin Updates
- **`claude plugin update` doesn't git pull**: Known Claude Code bug. The marketplace local clone at `~/.claude/plugins/marketplaces/launchcraft/` doesn't auto-fetch from remote. Users must run `/update` (our custom command) or manually `cd ~/.claude/plugins/marketplaces/launchcraft && git pull origin main` then `claude plugin update launchcraft@launchcraft`.
- **Must bump version on every push**: The plugin cache keys on version number. If you push changes without bumping `marketplace.json` + `plugin.json` version, `claude plugin update` says "already at latest" and the cache never refreshes. Always bump version before pushing.

### Git/GitHub
- **Account switching breaks push**: `gh auth switch` changes the CLI account but git push still uses old credentials. MUST run `gh auth setup-git --hostname github.com` after switching.
- **Empty repo can't use `--push`**: `gh repo create --push` fails with no commits. Create at least one commit first.

### User Interaction
- **All questions must use AskUserQuestion tool**: Never output a question as plain text. Always use AskUserQuestion with structured options. This applies to spark's probing questions, review/sign-off steps, and any other user-facing question.

### Performance
- **Parallelize with worktree isolation**: tdd-testing and impl dispatch parallel agents with `isolation: "worktree"`. Each agent works in its own git worktree (isolated copy), commits its work, and branches are merged back afterward. This prevents file conflicts between parallel agents.
- **Merge protocol after parallel work**: After worktree agents complete, merge each branch sequentially. For conflicts: read conflicting files, combine both sides (usually additive — different components), commit. Common conflicts: router files (keep both routes), barrel exports (keep both), config files (merge entries).
- **Commit before dispatching worktrees**: Always commit current state before dispatching worktree agents — this is the base they start from.
- **Post-skill agents in parallel**: contract-validator + code-reviewer dispatch simultaneously (code-reviewer in background).
- **Don't serialize what can be parallelized**: If 2+ components/test domains are independent, they MUST be parallelized. Sequential-only execution is a bug.

### Plugin Design
- **Self-validation is unreliable**: Don't trust a skill to check its own output. Always use an independent agent (contract-validator) for verification.
- **Auto-run vs "Review with User" conflict**: Each skill has "Review with User" and "Iterate until user approves" steps for standalone use. During full pipeline auto-run these MUST be skipped. Fixed by: (1) SessionStart hook injects FULL PIPELINE AUTO-RUN instruction when pipeline is in progress, (2) spark skill has CRITICAL OVERRIDE calling out that downstream review steps don't apply, (3) each downstream skill has a "Pipeline auto-run mode" blockquote at the top that says to skip review steps when invoked automatically.
- **Don't duplicate hook instructions in skills**: If the hook injects global instructions (like auto-memory), adding the same to each skill is redundant and bloats context. Keep skills focused on their domain. Exception: the "Pipeline auto-run mode" note in each skill is necessary because skill instructions override earlier context.
- **Rationalization tables must be skill-specific**: Generic "don't skip steps" doesn't work. Each skill needs its own table targeting the specific shortcuts agents try for that stage.
- **Evidence gates need concrete checkboxes**: Vague "verify before completing" gets ignored. Each skill needs explicit "show this output" requirements.

### Image Assets (Generated + Real)
- **Two pipelines**: `type: generated` uses nano-banana MCP (AI), `type: real` uses web search + download. Both run in parallel after design docs are merged.
- **No transparent backgrounds**: nano-banana cannot generate transparent PNGs. Always design with solid or gradient backgrounds.
- **Text in images is unreliable**: Generated images often have garbled/misspelled text. Default to `has_text: false`. If text is essential, use `nano-banana-pro` (best text rendering). If text is still garbled after retry, regenerate WITHOUT text using `nano-banana` (cheapest).
- **Model selection by content**: `nano-banana` for no-text images (cheapest), `nano-banana-pro` for images that must contain readable text (best quality). `nano-banana-2` is the balanced default.
- **Budget before generation**: Always show the user an image manifest with estimated costs BEFORE generating. Multiple images should be generated in parallel.
- **Worktree agents can't call MCP**: Design doc worktree agents insert `IMAGE_REQUEST` placeholders. After merge, the main agent handles all image sourcing (MCP + web search), then dispatches verification agents.
- **Verification loop**: After generation/download, a subagent reads each image to check quality. FAIL_TEXT → retry without text (cheaper model). FAIL_RESOLUTION → re-search or fall back to generated. Max 2 retries per image.
- **Real images need resolution minimums**: Hero/banner = 1920×1080, inline = 1200×800, card = 800×600, icon = 512×512. Low-res images on retina displays look terrible.
- **Real images need attribution**: Every `.launchcraft/designs/US-NNN-[slug]/assets/` folder with real images must have `ATTRIBUTION.md` tracking source, license, and original URL.
- **Use real for photos, generated for graphics**: AI-generated photos of people/places look uncanny. Use `type: real` for any real-world photography. Use `type: generated` for illustrations, icons, patterns, conceptual graphics.

### Contract System
- **Contracts are the single source of truth**: Validation rules live in `docs/contracts.md`, not scattered across skills. The contract-validator agent reads from there.
- **Upstream failures cascade**: If user-story output is bad, every downstream skill fails. The contract-validator catches this at the boundary, but fixing means re-running upstream — not patching downstream.

### Pipeline Architecture
- **Orchestrator pattern**: `/run-pipeline` skill runs the entire pipeline in one continuous turn. Each stage is a `Skill()` call — the agent never "decides to stop" between stages.
- **Spark is the entry point**: spark collects requirements, then calls `Skill(skill='run-pipeline')` which handles everything from research through launch.
- **Individual skills are self-contained**: each skill does its work and returns. It does NOT call the next skill — the orchestrator handles sequencing.

### Hooks
- **SessionStart** (`session-start`): context injection, pipeline stage detection.
- **PreToolUse** (`enforce-paths`): blocks Write/Edit of pipeline .md files outside `.launchcraft/`. Blocks flat structures.
- **Stop** (`pipeline-advance`): safety net — if agent stops mid-pipeline, nudges it to call `run-pipeline`. Checks `stop_hook_active` to prevent infinite loops.
- **Cross-platform wrapper**: `run-hook.cmd` polyglot ensures hooks work on Windows (batch) and Unix (bash).
