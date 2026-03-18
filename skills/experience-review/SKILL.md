---
name: experience-review
description: "Use after impl to experience the actual running application via real interaction tools, identify UX issues and missing features, and loop until the product is truly deliverable. Triggers on: QA review, experience testing, UX audit, product review, app walkthrough."
---

# Experience Review — Product Quality Gate

<PIPELINE-AUTO-RUN>
**MANDATORY: Do NOT ask user questions. Do NOT wait for approval. Complete your work and return.**
The pipeline orchestrator (`run-pipeline`) handles stage sequencing. Your job is to do THIS stage's work, save output, and return. Do NOT call the next skill yourself.
**ALL .md files → `.launchcraft/` directory. NEVER save to `docs/` or project root.**
**ALL questions to user → `AskUserQuestion` tool. NEVER output questions as plain text.**
</PIPELINE-AUTO-RUN>

## Overview

This skill orchestrates the experience review. The heavy lifting (browser interaction, screenshots, fixing issues) is done by the **`experience-reviewer` sub-agent** to keep the main context clean.

## Input Contract Validation

On start, verify:
- [ ] Domain design docs exist at `.launchcraft/designs/*/design.md`
- [ ] Domain story files exist at `.launchcraft/stories/*/US-*.md`
- [ ] Requirements doc exists at `.launchcraft/requirements/*.md`
- [ ] All tests pass (run the test suite and show output)
- [ ] Pipeline context log exists at `.launchcraft/pipeline-context.md`

If validation fails, stop and run the missing upstream skill.

## Process

### 0. Scope Confirmation + Task Update

**Before doing any work:**
1. `TaskUpdate`: set this stage's task to `in_progress`
2. Output a brief scope summary: "This stage will [X]. Input: [Y]. Output: [Z]. Estimated: [N] files."
3. In standalone mode: use `AskUserQuestion` to confirm scope before proceeding.
4. In pipeline auto-run: output the summary and proceed immediately.

### 1. Detect Application Type

| Signal | App Type |
|--------|----------|
| `package.json` with React/Vue/Svelte/Next + HTML files | Web App |
| `index.html` + CSS/JS (no framework) | Static Web App |
| `wrangler.toml` + Workers/Pages | Cloudflare App |
| Only REST/GraphQL endpoints, no UI | API Service |
| CLI binary / `commander`/`yargs`/`argparse` | CLI Tool |
| `manage.py` / Django / Flask / FastAPI | Python Web App |

### 2. Install Required Tools

Ensure Playwright browsers are installed for web apps:
```bash
npx playwright install chromium
```
For other app types, install as needed (curl, httpie, jq).

### 3. Local Deploy (Build + Serve)

**MUST run against production build, NOT dev server.**

```bash
# Build
npm run build  # or equivalent

# Serve production build
npx vite preview &          # Vite
# npm run start &           # Next.js
# wrangler dev &            # Cloudflare
# npx serve dist/ &         # Static

# Poll until responsive
for i in $(seq 1 15); do curl -sf http://localhost:4173 > /dev/null && break; sleep 2; done
```

Verify the server is responding before proceeding.

### 4. Dispatch Experience-Reviewer Agent

Dispatch the **`experience-reviewer`** sub-agent in the foreground. It runs the full review, fixes issues, and loops until APPROVED.

```
Agent(subagent_type="experience-reviewer"):
  prompt: "App type: [type]
           Base URL: [url]
           Requirements: .launchcraft/requirements/*.md
           User stories: .launchcraft/stories/*/US-*.md
           Design docs: .launchcraft/designs/*/design.md
           API contract: .launchcraft/api-contract.yaml
           Frontend design: .launchcraft/frontend-design/*.md
           Competitor screenshots: .launchcraft/research/screenshots/
           You are a REVIEWER only — do NOT fix code.
           Report every issue with severity, screenshot, and rollback target.
           Score must be >= 4.0 overall, >= 3 per category to APPROVE.
           Save report to .launchcraft/experience-review/"
```

The agent returns one of:
- **APPROVED** — all scores pass, no P0 issues
- **NEEDS-FIXES** — issues found with rollback targets per issue

### 5. Handle Result

**If APPROVED:**
1. Dispatch **contract-validator** agent
2. On PASS: dispatch **product-manager** agent. If PM PROCEED: call `Skill(skill='test-report')`. If PM ROLLBACK(target): call `Skill(skill=target)`

**If NEEDS-FIXES:**
1. Read the review report — find the **earliest rollback target** across all issues
2. Append the review findings to `.launchcraft/pipeline-context.md` so the target stage knows what to fix
3. Use `AskUserQuestion` to show the user the issues and proposed rollback:
   ```
   "Experience review found [N] issues:
    - [N] issues → rollback to impl
    - [N] issues → rollback to frontend-design
    - [N] issues → rollback to enhance (missing features)
    Recommended: rollback to [earliest stage]. Proceed?"
   Options: Accept rollback / Rollback to different stage / Approve anyway
   ```
4. Execute the rollback: call `Skill(skill=[target])` — the pipeline re-runs from that stage
5. Experience review will run again automatically after impl completes

## Evidence Gate

Before claiming complete:
- [ ] App built and served as production build (show URL)
- [ ] experience-reviewer agent dispatched and returned APPROVED (show verdict)
- [ ] Review report saved at `.launchcraft/experience-review/` (show path)
- [ ] contract-validator returned PASS (show result)
