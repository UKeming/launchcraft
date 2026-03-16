# LaunchCraft

Claude Code plugin: end-to-end product development pipeline via skills, MCP, agents, and memory.

## Pipeline

spark → research → differentiation → enhance → differentiation (re-run) → accountant (pre-planning) → user-story → design-doc → frontend-design → tdd-testing → impl → experience-review → test-report → launch → accountant (post-launch)

### Agents dispatched during pipeline:
- **contract-validator** — after every skill, validates output against contracts
- **accountant** — after 2nd differentiation (pre-planning: go/no-go) and after launch (post-launch: detailed financial report)
- **code-reviewer** — after tdd-testing and impl, reviews code quality and auto-fixes
- **frontend-tester** — after frontend-design, tests every page with Playwright

### Pipeline Context Log
- Every skill appends execution summary to `docs/pipeline-context.md`
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

## Domain-Based Doc Structure

User stories and design docs are organized by domain folders. Each domain co-locates its stories and design:

```
docs/
  [domain]/                    # e.g., auth/, dashboard/, system/
    stories/
      US-NNN-[slug].md         # individual story file with frontmatter
    design.md                  # domain's design doc
  user-stories-index.md        # global feature inventory + coverage matrix
  story-coverage.md            # global story → design doc mapping
```

- **user-story skill** creates domain folders + individual story files + global index
- **design-doc skill** reads stories from domain folders, writes `design.md` into each domain folder
- **tdd-testing** and **impl** read `docs/*/design.md` + `docs/*/stories/US-*.md`
- Hooks detect both new (`docs/*/stories/`) and legacy (`docs/user-stories/`) paths

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
- **Real images need attribution**: Every `docs/[domain]/assets/` folder with real images must have `ATTRIBUTION.md` tracking source, license, and original URL.
- **Use real for photos, generated for graphics**: AI-generated photos of people/places look uncanny. Use `type: real` for any real-world photography. Use `type: generated` for illustrations, icons, patterns, conceptual graphics.

### Contract System
- **Contracts are the single source of truth**: Validation rules live in `docs/contracts.md`, not scattered across skills. The contract-validator agent reads from there.
- **Upstream failures cascade**: If user-story output is bad, every downstream skill fails. The contract-validator catches this at the boundary, but fixing means re-running upstream — not patching downstream.

### Hooks
- **SessionStart hook runs test suites**: The pipeline stage detection actually runs `npm test` / `pytest` etc. This can be slow on large projects. Keep it best-effort with timeouts.
- **Hook output is JSON**: Must escape special characters properly. The `escape_for_json` helper handles newlines, quotes, backslashes.
- **Cross-platform wrapper is required**: `run-hook.cmd` polyglot ensures hooks work on Windows (batch) and Unix (bash).
- **Stop hook needs cooldown**: The pipeline-advance stop hook fires on EVERY stop attempt. Without a cooldown, it creates an infinite loop when the agent can't immediately advance (e.g., waiting for background agents). Fixed by writing `.launchcraft-advance-state` with the last directive — same directive within 5 minutes is suppressed.
