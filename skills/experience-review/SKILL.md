---
name: experience-review
description: "Use after impl to experience the actual running application via real interaction tools, identify UX issues and missing features, and loop until the product is truly deliverable. Triggers on: QA review, experience testing, UX audit, product review, app walkthrough."
---

# Experience Review — Product Quality Gate

<PIPELINE-AUTO-RUN>
**MANDATORY: Do NOT ask user questions. Do NOT wait for approval. Do NOT stop after saving.**
Build + serve → dispatch experience-reviewer agent → on APPROVED dispatch contract-validator → on PASS call Skill tool: Skill(skill='test-report').
This is a continuous pipeline — you do NOT stop between stages.
**ALL .md files → `.launchcraft/` directory. NEVER save to `docs/` or project root.**
**ALL questions to user → `AskUserQuestion` tool. NEVER output questions as plain text.**
</PIPELINE-AUTO-RUN>

## Overview

This skill orchestrates the experience review. The heavy lifting (browser interaction, screenshots, fixing issues) is done by the **`experience-reviewer` sub-agent** to keep the main context clean.

## Input Contract Validation

On start, verify:
- [ ] Domain design docs exist at `.launchcraft/*/design.md`
- [ ] Domain story files exist at `.launchcraft/*/stories/US-*.md`
- [ ] Requirements doc exists at `.launchcraft/requirements/*.md`
- [ ] All tests pass (run the test suite and show output)
- [ ] Pipeline context log exists at `.launchcraft/pipeline-context.md`

If validation fails, stop and run the missing upstream skill.

## Process

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
           User stories: .launchcraft/*/stories/US-*.md
           Design docs: .launchcraft/*/design.md
           API contract: .launchcraft/api-contract.yaml
           Frontend design: .launchcraft/frontend-design/*.md
           Review, fix, and loop until APPROVED.
           Save report to .launchcraft/experience-review/"
```

The agent returns one of:
- **APPROVED** — proceed to validation
- **BACK-TO-[stage]** — invoke that stage's skill

### 5. Handle Result

**If APPROVED:**
1. Dispatch **contract-validator** agent:
   ```
   Agent: contract-validator
   Skill: experience-review
   Output path: .launchcraft/experience-review/*.md
   ```
2. On PASS: run `echo "test-report" > .launchcraft/.pipeline-next` then **call the Skill tool: `Skill(skill='test-report')`**

**If BACK-TO-[stage]:**
1. Append reasoning to `.launchcraft/pipeline-context.md`
2. Invoke the target skill (e.g., `/impl`, `/frontend-design`)

## Evidence Gate

Before claiming complete:
- [ ] App built and served as production build (show URL)
- [ ] experience-reviewer agent dispatched and returned APPROVED (show verdict)
- [ ] Review report saved at `.launchcraft/experience-review/` (show path)
- [ ] contract-validator returned PASS (show result)
