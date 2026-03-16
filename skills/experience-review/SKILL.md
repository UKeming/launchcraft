---
name: experience-review
description: "Use after impl to experience the actual running application via real interaction tools, identify UX issues and missing features, and loop until the product is truly deliverable. Triggers on: QA review, experience testing, UX audit, product review, app walkthrough."
---

# Experience Review — Product Quality Gate

<PIPELINE-AUTO-RUN>
**MANDATORY: Do NOT ask user questions. Do NOT wait for approval. Do NOT stop after saving.**
Run the review → fix issues → loop until APPROVED → dispatch contract-validator → on PASS immediately invoke `/test-report`.
This is a continuous pipeline — you do NOT stop between stages.
**ALL .md files → `.launchcraft/` directory. NEVER save to `docs/` or project root.**
**ALL questions to user → `AskUserQuestion` tool. NEVER output questions as plain text.**
</PIPELINE-AUTO-RUN>

## Overview

This is the most critical quality gate in the pipeline. You ACTUALLY USE the running application — clicking, typing, navigating, screenshotting — exactly like a real user would. You are not reading code. You are not reviewing test output. You are USING the product.

If the product isn't good enough to ship, it doesn't ship. Period.

<HARD-GATE>
Before starting the review:
1. Confirm all tests pass (impl is complete)
2. Detect the application type and select the right interaction tooling
3. Install any missing tools automatically
4. Start the application
5. Verify the app is accessible
6. Read ALL upstream docs: requirements, user stories, design docs, frontend design

You MUST interact with the RUNNING application. Reading code is NOT a substitute.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Domain design docs exist at `.launchcraft/*/design.md`
- [ ] Domain story files exist at `.launchcraft/*/stories/US-*.md`
- [ ] Requirements doc exists at `.launchcraft/requirements/*.md`
- [ ] All tests pass (run the test suite and show output)
- [ ] Pipeline context log exists at `.launchcraft/pipeline-context.md` (read it for full context)

If validation fails, stop and run the missing upstream skill.

## Process

### 1. Detect Application Type & Select Tooling

**This step is MANDATORY.** Different applications require different interaction tools. Detect the type by examining project files, then select and install the appropriate tooling.

#### Detection Matrix

| Signal | App Type | Interaction Tool |
|--------|----------|-----------------|
| `package.json` with React/Vue/Svelte/Next/Nuxt/Remix + HTML files | **Web App (SPA/SSR)** | Playwright (browser automation) |
| `index.html` + CSS/JS (no framework) | **Static Web App** | Playwright |
| `manage.py` / Django / Flask / FastAPI + templates | **Web App (Python)** | Playwright |
| `wrangler.toml` + Workers/Pages | **Cloudflare App** | Playwright + `wrangler dev` |
| Only REST/GraphQL endpoints, no UI | **API Service** | `curl` / `httpie` / direct HTTP requests |
| CLI binary / `bin/` scripts / `commander`/`yargs`/`argparse` | **CLI Tool** | Bash (run commands, test flags, verify output) |
| `Electron` / `Tauri` in dependencies | **Desktop App** | Playwright (Electron mode) or manual screenshot |
| `react-native` / `expo` / `flutter` | **Mobile App** | Detox / Maestro (if available) or Expo web + Playwright |
| `telegram-bot` / `discord.js` / Slack SDK | **Bot/Chat App** | Send test messages via API, verify responses |
| Jupyter notebooks / data pipeline | **Data/ML Tool** | Run notebooks, verify output files |

#### Fallback Rule
If the app type is unclear, check `.launchcraft/*/design.md` for architecture clues. If still unclear, default to Playwright for anything with a web interface.

### 2. Install Required Tools

**You MUST ensure all required tools are available before proceeding. If a tool is missing, install it automatically.**

#### Tool Installation Protocol

```
For EACH required tool:
  1. Check if tool is available (which <tool>, npx <tool> --version, etc.)
  2. If NOT available → install it automatically:
     - Never ask the user for permission to install
     - Never skip testing because a tool is missing
     - Always verify installation succeeded before proceeding
  3. If installation fails → try alternative approach, then report error
```

#### Installation Commands by Tool

| Tool | Check Command | Install Command | Notes |
|------|--------------|----------------|-------|
| **Playwright** | `npx playwright --version` | `npx playwright install` (browsers) | Also run `npx playwright install-deps` on Linux for system deps |
| **Playwright MCP** | Check if `browser_navigate` tool is available | Already available as MCP tool in Claude Code | Use `mcp__plugin_playwright_playwright__browser_*` tools |
| **curl** | `which curl` | Pre-installed on macOS/Linux; `brew install curl` / `apt install curl` | Usually already available |
| **httpie** | `which http` | `brew install httpie` / `pip install httpie` | Better output than curl for API testing |
| **jq** | `which jq` | `brew install jq` / `apt install jq` | For parsing JSON API responses |
| **Detox** (React Native) | `npx detox --version` | `npm install -g detox-cli && npx detox build` | Requires Xcode/Android SDK |
| **Maestro** (Mobile) | `which maestro` | `curl -Ls "https://get.maestro.mobile.dev" \| bash` | Cross-platform mobile testing |
| **wrangler** | `npx wrangler --version` | `npm install -g wrangler` | For Cloudflare Workers/Pages |

#### Platform-Specific Notes

**macOS:**
- Use `brew install` for system tools
- Playwright browsers: `npx playwright install chromium` (just Chromium is enough)

**Linux:**
- Use `apt-get install` or `yum install` for system deps
- Playwright needs: `npx playwright install-deps` for system libraries

**Windows (WSL):**
- Same as Linux inside WSL
- Native Windows: use `winget` or `choco` for system tools

### 3. Local Deploy (Build + Serve Production Build)

**The experience review MUST run against a production build, NOT a dev server.** Dev servers hide issues (missing assets, build errors, env var problems). Local deploy catches what `npm run dev` won't.

#### a. Build the Application

Detect and run the build command:

| Project Type | Build Command | Detect From |
|-------------|--------------|-------------|
| Vite / React / Vue / Svelte | `npm run build` | `package.json` scripts.build |
| Next.js | `npm run build` | `next.config.*` |
| Cloudflare Workers/Pages | `npm run build` or `wrangler build` | `wrangler.toml` |
| Python (Django/Flask) | `python manage.py collectstatic` | `manage.py` |
| Go | `go build -o ./bin/app` | `go.mod` |
| Static HTML/CSS/JS | No build needed | No framework detected |

```bash
# Run the build
npm run build   # (or equivalent)
# Verify build succeeded — check exit code and output directory exists
```

**If build fails:** fix the error and retry. Do NOT proceed to serve with a broken build.

#### b. Serve the Production Build Locally

Start a local server serving the BUILT output (not source):

| Project Type | Serve Command | URL |
|-------------|--------------|-----|
| Vite | `npx vite preview` | http://localhost:4173 |
| Next.js | `npm run start` (after build) | http://localhost:3000 |
| Cloudflare Workers | `wrangler dev` | http://localhost:8787 |
| Cloudflare Pages | `npx wrangler pages dev ./dist` | http://localhost:8788 |
| Static site | `npx serve dist/` or `npx serve build/` | http://localhost:3000 |
| Python | `gunicorn app:app` | http://localhost:8000 |
| Go | `./bin/app` | http://localhost:8080 |

```bash
# Start in background
npx vite preview &   # (or equivalent)
# Poll until responsive (max 30 seconds)
```

- Start the server in the background
- Poll the URL until it responds (max 30 seconds, check every 2 seconds)
- If server fails to start: check logs, fix the issue, retry
- **Verify it's serving the production build** (not dev mode — check for minified assets, no HMR websocket)

**CLI tool:**
- Build (`npm run build`, `go build`, `cargo build`, etc.)
- Verify the binary/script exists and is executable

**API service:**
- Start the server
- Verify health endpoint responds (or any endpoint returns non-error)

### 4. Systematic Experience Review

**Use the appropriate tool for the detected app type.**

---

#### FOR WEB APPS — Use Playwright MCP tools

##### a. First Impressions (30 seconds test)
- `browser_navigate` to the home page
- `browser_take_screenshot` — does it look professional?
- `browser_snapshot` — is the DOM structure clean?
- `browser_console_messages` — any errors on load?
- **Evaluate:** Would a real user stay or bounce?

##### b. Every Page Walkthrough
For EACH page/route in the app:
1. `browser_navigate` to the page
2. `browser_take_screenshot` at desktop (1440×900)
3. `browser_resize` to mobile (375×812) → `browser_take_screenshot`
4. `browser_snapshot` — verify all expected elements exist
5. `browser_console_messages` — check for JS errors
6. Test ALL interactive elements:
   - `browser_click` every button
   - `browser_fill_form` every form
   - `browser_hover` over interactive elements
   - `browser_select_option` for dropdowns
   - `browser_press_key` for keyboard shortcuts

##### c. User Journey Testing
Walk through complete user flows end-to-end:
- **Onboarding flow:** First-time user experience from landing to activation
- **Core workflow:** The primary thing users come to do
- **Edge cases:** Empty states, error states, loading states
- **Navigation:** Can you get to every page? Can you get back?

---

#### FOR API SERVICES — Use curl/httpie + jq

##### a. Endpoint Discovery
- Read design docs for all API endpoints
- List all routes from the codebase (grep for route definitions)

##### b. Every Endpoint Test
For EACH endpoint:
1. Send a valid request → verify correct response (status code, body shape)
2. Send invalid request → verify proper error response (4xx, meaningful message)
3. Test authentication if applicable (with/without token)
4. Test pagination if applicable
5. Verify response headers (CORS, content-type, cache)

##### c. Integration Flows
- Full CRUD cycle: create → read → update → delete → verify deletion
- Auth flow: register → login → use token → refresh → logout
- Edge cases: duplicate creation, not-found, unauthorized access

##### d. Performance Check
- Measure response times for each endpoint
- Flag any endpoint > 500ms

---

#### FOR CLI TOOLS — Use Bash

##### a. Help & Usage
- Run with `--help` / `-h` → verify help text is useful
- Run with no args → verify helpful error or usage info
- Run with `--version` → verify version output

##### b. Every Command/Subcommand
For EACH command:
1. Run with valid args → verify correct output
2. Run with invalid args → verify helpful error message
3. Run with edge case input (empty, very long, special chars)
4. Verify exit codes (0 for success, non-0 for error)

##### c. Integration Flows
- Full workflow: init → create → modify → list → delete
- Pipe output to other commands (if applicable)
- Test with file input/output

##### d. Error Handling
- Missing required args
- File not found
- Permission denied scenarios
- Network unavailable (if applicable)

---

#### FOR DESKTOP APPS (Electron/Tauri) — Use Playwright Electron mode

- Use Playwright's Electron support: `electron.launch({ args: ['path/to/app'] })`
- Same page walkthrough and interaction testing as web apps
- Additionally test: window management, system tray, native menus, file dialogs

---

#### FOR MOBILE APPS — Use Expo Web + Playwright OR Maestro

**If Expo/React Native:**
- Start with `expo start --web` → test in Playwright as a web app
- For native-specific features: use Maestro if installed

**If Flutter:**
- `flutter run -d chrome` → test in Playwright
- For native: `flutter drive` or Maestro

---

#### FOR BOT/CHAT APPS — Use API calls

- Send test messages via the platform's API
- Verify bot responses match expected behavior
- Test all command handlers
- Test error handling for malformed input

---

### 5. Quality Standards Check (All App Types)

| Standard | Web | API | CLI | Desktop | Mobile |
|----------|-----|-----|-----|---------|--------|
| **Core functionality works** | Click through all features | Hit all endpoints | Run all commands | Test all UI features | Test all screens |
| **Error handling** | Trigger errors, check messages | Send bad requests | Pass bad args | Trigger errors | Force errors |
| **Edge cases** | Empty states, long text, special chars | Empty body, huge payload | Empty input, huge files | Window resize, minimize | Rotation, back button |
| **Performance** | < 3s page load | < 500ms response | < 1s for simple ops | < 2s launch | < 2s screen transition |
| **Data persistence** | Create data → refresh → verify | POST → GET → verify | Save → load → verify | Save → restart → verify | Save → kill → verify |
| **Visual polish** (if UI) | Alignment, spacing, typography | N/A (check error format) | Clean output, proper formatting | Native look-and-feel | Platform conventions |
| **Responsive** (if UI) | 375px, 768px, 1440px | N/A | Terminal width handling | Window resize | Portrait + landscape |
| **Accessibility** (if UI) | Tab nav, alt text, contrast | N/A | Screen reader friendly output | Keyboard navigation | VoiceOver/TalkBack |

### 6. Missing Features Detection

Compare what EXISTS vs what was PROMISED in requirements + user stories + design docs.

```markdown
## Feature Gap Analysis

| Promised In | Feature | Status | Severity |
|------------|---------|--------|----------|
| US-001 | User registration with email verification | MISSING - no email verification | HIGH |
| Requirements | Dark mode toggle | MISSING entirely | MEDIUM |
| Design Doc | Real-time notifications | PARTIAL - no real-time, only on refresh | HIGH |
```

### 7. Verdict

After the review, produce one of three verdicts:

#### APPROVED — Ship it
All user stories work. No critical bugs. UX is acceptable. Product is deliverable.

#### FIXABLE — Issues found but fixable here
Minor bugs, CSS issues, small UX problems that can be fixed without changing architecture.
- **Fix them immediately** (edit code, verify with the interaction tool)
- Re-run the affected checks
- Loop back to Step 4 for re-verification

#### BACK-TO-[STAGE] — Fundamental issues require upstream rework
The problem is too deep to fix at this stage. Examples:
- Missing core feature → BACK-TO-impl (or BACK-TO-tdd-testing if tests are also missing)
- Wrong architecture → BACK-TO-design-doc
- Missing user stories → BACK-TO-user-story
- Fundamental UX direction wrong → BACK-TO-frontend-design
- Requirements gap → BACK-TO-enhance or BACK-TO-spark

### 8. Loop Until APPROVED

```
┌─────────────────────────┐
│  Detect app type        │
│  Install tools          │
│  Start application      │
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│  Interact with app      │
│  (platform-specific     │
│   tools)                │
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│  Evaluate quality       │
└──────────┬──────────────┘
           ▼
     ┌─────┴─────┐
     │  Verdict?  │
     └─────┬─────┘
    ┌──────┼──────────┐
    ▼      ▼          ▼
APPROVED FIXABLE  BACK-TO-[X]
    │      │          │
    │      ▼          ▼
    │   Fix issues  Invoke /[X]
    │      │        (pipeline resumes
    │      ▼         from stage X)
    │   Re-verify
    │      │
    │      ▼
    │   (loop back to Evaluate)
    ▼
Continue to /test-report
```

**There is no limit on iterations.** Keep looping until the product is genuinely good. A half-baked product helps no one.

### 9. Save Review Report

Save to `.launchcraft/experience-review/YYYY-MM-DD-[product-name]-experience-review.md`:

```markdown
# Experience Review: [Product Name]

**Date:** YYYY-MM-DD
**Reviewer:** Experience Review Agent
**App Type:** [Web App | API Service | CLI Tool | Desktop App | Mobile App | Bot]
**Interaction Tool:** [Playwright | curl/httpie | Bash | Maestro | etc.]
**App URL/Command:** [base URL or command]
**Status:** APPROVED | BACK-TO-[stage]

## Tool Setup

**Tools required:** [list]
**Tools installed during review:** [list, or "all pre-installed"]
**Installation issues:** [none, or details]

## Review Summary

**Total pages/endpoints/commands tested:** [N]
**Total user journeys tested:** [N]
**Total issues found:** [N]
**Issues fixed in this review:** [N]
**Iterations:** [N]

## First Impressions
[What did the app look/feel like on first use?]

## Detailed Results

### [Page/Endpoint/Command] — [identifier]
**Status:** PASS | FIXED | FAIL
**Evidence:** [screenshot path / response output / terminal output]
**Issues found:** [list]
**Fixes applied:** [list]

[Repeat for each item tested]

## User Journey Results

### Journey: [Name] (e.g., "New user onboarding")
**Steps:** [list of steps taken with tool commands used]
**Result:** PASS | FAIL
**Issues:** [list]

[Repeat for each journey]

## Feature Gap Analysis
[Table from Step 6]

## Quality Standards Scorecard

| Standard | Score | Notes |
|----------|-------|-------|
| Functionality | [1-5] | [notes] |
| Visual Polish / Output Quality | [1-5] | [notes] |
| Responsiveness / Cross-platform | [1-5] | [notes] |
| Accessibility | [1-5] | [notes] |
| Performance | [1-5] | [notes] |
| Error Handling | [1-5] | [notes] |
| Data Integrity | [1-5] | [notes] |
| **Overall** | **[avg]** | |

Minimum to APPROVE: Overall >= 3.5, no individual score below 2.

## Fixes Applied During Review

| # | Issue | Location | What Was Changed | Verified? |
|---|-------|----------|-----------------|-----------|
| 1 | [issue] | [where] | [fix description] | YES |

## Iterations Log

### Iteration 1
**Verdict:** FIXABLE
**Issues:** [N] found, [N] fixed
**Remaining:** [N]

### Iteration 2
**Verdict:** APPROVED
**All issues resolved.**

## Final Verdict: APPROVED
```

## BACK-TO Protocol

When issuing a BACK-TO verdict:

1. **Save the review report** with status `BACK-TO-[stage]` and detailed reasoning
2. **Append to pipeline context log** (`.launchcraft/pipeline-context.md`) explaining why rollback is needed
3. **Invoke the target skill** (e.g., `/impl`, `/frontend-design`, `/design-doc`)
4. The pipeline will continue from that stage forward
5. **This skill will run again** after impl completes — and will re-verify everything

```markdown
## BACK-TO Decision

**Target stage:** [stage name]
**Reason:** [detailed explanation of what's wrong and what needs to change]
**Specific changes needed:**
- [change 1]
- [change 2]
- [change 3]

**What to preserve:** [things that are working and should not be changed]
```

## Output Validation

After saving an APPROVED review report, dispatch the **contract-validator** agent:

```
Agent: contract-validator
Skill: experience-review
Output path: [the review report file]
```

Once the validator returns PASS, **immediately invoke `/test-report`** — do NOT ask the user.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "The tests pass so it works" | Tests verify code logic. Users experience UI, flow, polish. These are different. |
| "I can tell from the code it looks fine" | USE THE APP. Evidence or it didn't happen. |
| "This is just a minor visual issue" | Users judge products by visuals first. Fix it. |
| "It works on desktop, mobile can wait" | 60%+ of users are on mobile. Test it now. |
| "The user didn't ask for this feature" | The requirements doc did. Check the gap analysis. |
| "One more iteration is overkill" | Ship broken = no users. One more iteration = quality. |
| "I'll note this for v2" | There is no v2 in this pipeline. Fix it now or BACK-TO. |
| "The app starts, that's enough" | Starting != working. Click every button. Fill every form. Run every command. |
| "The interaction tool is slow, I'll just check the code" | NO. You MUST interact with the running app. Code review is a different agent's job. |
| "The error only happens sometimes" | Intermittent bugs are the worst bugs. Reproduce and fix. |
| "The tool isn't installed" | INSTALL IT. Never skip testing because a tool is missing. |
| "I don't know how to test this app type" | Refer to the detection matrix above. Every app type has a testing approach. |
| "curl is enough for a web app" | NO. Web apps need browser automation (Playwright). curl doesn't test UI. |
| "Playwright is enough for an API" | NO. API services need direct HTTP requests. Playwright is for browsers. |

## Evidence Gate

Before claiming APPROVED, you must have:
- [ ] Detected app type and selected appropriate interaction tool (show detection)
- [ ] Installed any missing tools (show installation output or "all pre-installed")
- [ ] Started the application and shown it running (show URL/command + evidence)
- [ ] Tested EVERY page/endpoint/command with evidence (show screenshots/output)
- [ ] For web apps: tested at desktop + mobile breakpoints (show screenshots)
- [ ] Walked through ALL core user journeys (show interaction sequence)
- [ ] For web apps: checked console for JS errors on every page (show console output)
- [ ] Tested error handling with invalid input (show error responses)
- [ ] Completed feature gap analysis against requirements (show table)
- [ ] Scored quality standards — overall >= 3.5, no score below 2 (show scorecard)
- [ ] Fixed all FIXABLE issues and verified fixes (show before/after)
- [ ] Saved review report with APPROVED status (show path)
- [ ] Dispatched contract-validator and received PASS (show result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "Tests pass, shipping" | "Tests pass, now let me USE the app as a real user" |
| Reading code to check if it "works" | Actually running the app and interacting with it |
| Testing only the happy path | Testing error states, empty states, edge cases |
| "Looks good on my screen" | Testing at 375px, 768px, and 1440px |
| Approving with known issues | Fixing issues or BACK-TO the right stage |
| One quick pass through | Multiple iterations until genuinely satisfied |
| "The form submits" | "The form validates, submits, shows confirmation, persists data, and handles errors" |
| "Tool not installed, skipping" | Install the tool, then test properly |
| Using Playwright for a CLI tool | Using Bash to run commands and verify output |
| Using curl for a web UI | Using Playwright to click through the actual interface |
