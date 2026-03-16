---
name: launch
description: "Use when deploying a completed and tested application to Cloudflare. Triggers on: deploying to production, launching an app, going live, publishing to Cloudflare."
---

# Launch to Cloudflare

<PIPELINE-AUTO-RUN>
**MANDATORY: Do NOT stop after saving. Auto-proceed after deploy.**
**EXCEPTION: You MUST ask the user for API keys and secrets.** This is the ONE stage where stopping to ask is required — real keys cannot be guessed or skipped. Use `AskUserQuestion` for each key needed.
**ALL .md files → `.launchcraft/` directory. NEVER save to `docs/` or project root.**
**ALL questions to user → `AskUserQuestion` tool. NEVER output questions as plain text.**
</PIPELINE-AUTO-RUN>

## Overview

Deploy a tested application to Cloudflare and assign it a subdomain under keming.co. This is the final pipeline stage — only proceed with a passing test report.

<HARD-GATE>
Before deploying:
1. Confirm test report exists and recommendation is "Ready to Launch"
2. Confirm with user: target subdomain, any environment variables, final go/no-go
3. Verify Cloudflare credentials are available (wrangler auth or API token)

Never deploy with failing tests or without explicit user approval.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Test report exists at `.launchcraft/test-reports/*.md`
- [ ] Test report Recommendation is "Ready to Launch"
- [ ] Test report has zero critical/major failures
- [ ] Application code builds successfully
- [ ] `wrangler` CLI is available or Cloudflare API token is configured

If validation fails, list specific violations and stop.

## Process

### 1. Pre-Launch Checklist

Verify with user:

```
Pre-launch checklist:
- [ ] Subdomain: [app-name].keming.co
- [ ] Environment variables configured
- [ ] Build succeeds locally
- [ ] All tests pass (per test report)
- [ ] DNS access to keming.co confirmed
```

### 2. Real Data & API Key Audit (BLOCKING)

<HARD-GATE>
**The app MUST use real data and real API keys before deploying. No mock data, no placeholder keys, no demo mode.**
This step BLOCKS deployment until ALL keys are provided by the user. Do NOT skip, guess, or proceed without them.
</HARD-GATE>

#### a. Scan for Required Environment Variables

Search the codebase for all referenced env vars:

```bash
# Find all env var references
grep -rn "process\.env\." src/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" | grep -oP 'process\.env\.\K[A-Z_]+' | sort -u
grep -rn "import\.meta\.env\." src/ --include="*.ts" --include="*.js" | grep -oP 'import\.meta\.env\.\K[A-Z_]+' | sort -u
# Check wrangler.toml for [vars] and secrets
grep -A 20 '\[vars\]' wrangler.toml 2>/dev/null
# Check .env.example / .env.local
cat .env.example 2>/dev/null
```

Build a complete list of every env var the app needs.

#### b. Scan for Mock/Placeholder Data

Check for and flag:
- Mock API URLs (`localhost`, `jsonplaceholder.typicode.com`, `mockapi.io`, `example.com`)
- Placeholder API keys (`sk-test-`, `pk_test_`, `YOUR_API_KEY`, `xxx`, `dummy`, `placeholder`)
- Lorem ipsum or demo content in production code
- Feature flags set to `mock`, `demo`, `test`, or `dev` mode
- Hardcoded test credentials (`admin/admin`, `test@test.com`)

```bash
grep -rn "localhost\|jsonplaceholder\|mockapi\|example\.com\|YOUR_API_KEY\|sk-test-\|pk_test_\|placeholder\|dummy_key\|lorem ipsum" src/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" || echo "No mock data found"
```

If ANY mock data is found → flag it and require replacement before proceeding.

#### c. Ask User for Each Missing Key (AskUserQuestion — ONE AT A TIME)

For EACH required env var / API key / secret that doesn't have a real value:

**Use `AskUserQuestion` to ask the user. Do NOT proceed until they provide it.**

Example:
```
AskUserQuestion: "Please provide your Stripe API key (STRIPE_SECRET_KEY). This is required for payment processing in production."
Options:
  - "I'll enter the key" (user types the key)
  - "Skip this feature" (disable the feature that needs this key)
  - "Use test key for now" (only if user explicitly chooses — NOT the default)
```

**Rules:**
- Ask for keys ONE AT A TIME — don't dump all at once
- Explain WHAT the key is for and WHERE to get it (link to the service's API key page)
- If the user says "skip", disable the feature cleanly (don't leave broken code)
- If the user provides a test key, warn them and record it in the launch doc
- **NEVER proceed to build/deploy with missing or placeholder keys**

#### d. Configure Secrets

For each key the user provides:
- Set as Cloudflare secret: `wrangler secret put KEY_NAME`
- Or add to wrangler.toml `[vars]` section (for non-sensitive values)
- Or set in `.env.production` (for local builds)
- Verify the key is NOT committed to git (`.gitignore` check)

#### e. Verify Real Data Connections

After all keys are configured, verify each external service actually connects:

```bash
# Example: test Stripe connection
curl -s https://api.stripe.com/v1/balance -u "$STRIPE_SECRET_KEY:" | jq .
# Example: test database connection
# Example: test email service
```

If any connection fails → ask user to verify the key and retry.

### 3. Build

Build the application for production:
- Detect build tool from project config (package.json, wrangler.toml, etc.)
- Run production build
- Verify build output exists and is not empty

### 3. Deploy to Cloudflare

Deploy using wrangler or Cloudflare API:
- Configure `wrangler.toml` if not present
- Set up custom domain: `[app-name].keming.co`
- Deploy to Cloudflare Workers/Pages
- Configure DNS CNAME record if needed

### 4. Smoke Test

After deployment, verify:
- [ ] Application is accessible at `[app-name].keming.co`
- [ ] Homepage loads successfully (HTTP 200)
- [ ] Core functionality works (based on user stories)
- [ ] No console errors

Report results to user.

### 5. Save Launch Record

Save to `.launchcraft/launches/YYYY-MM-DD-[topic]-launch.md`:

```markdown
# Launch: [Topic]

**Date:** YYYY-MM-DD
**URL:** https://[app-name].keming.co
**Platform:** Cloudflare Workers/Pages
**Status:** Live | Failed | Rolled Back

---

## Deployment Details

| Field | Value |
|-------|-------|
| Subdomain | [app-name].keming.co |
| Cloudflare Project | [project name] |
| Deploy Timestamp | YYYY-MM-DD HH:MM UTC |
| Build Tool | [tool] |
| Deploy Method | wrangler / API |

## Smoke Test Results

| Check | Status |
|-------|--------|
| App accessible | PASS/FAIL |
| Homepage loads (HTTP 200) | PASS/FAIL |
| Core functionality | PASS/FAIL |
| No console errors | PASS/FAIL |

## Related Artifacts

- User Stories: .launchcraft/*/stories/US-*.md
- Design Docs: .launchcraft/*/design.md
- Test Report: .launchcraft/test-reports/[file].md

## Rollback Instructions

If issues are found after launch:

1. Run: `wrangler rollback` or redeploy previous version
2. Verify rollback at https://[app-name].keming.co
3. Update this document Status to "Rolled Back"
4. Create issue in .launchcraft/issues/ describing the problem
```

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: launch
Output path: [the launch record file]
```

The validator will verify the URL is accessible, deployment details are real, and rollback instructions are present. If it returns FAIL, fix the violations and re-validate.

Once the validator returns PASS, dispatch the **accountant** agent for a post-launch financial report:

```
Agent: accountant
Phase: post-launch
Product name: [product name]
Project root: [project root]
```

The accountant will produce a detailed financial report with concrete costs based on actual services used, revenue projections based on actual features built, and a monetization roadmap. This is the final pipeline deliverable — present the financial report to the user alongside the launch confirmation.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "Test report says pass, just deploy" | Verify the test report is CURRENT. Re-check recommendation field. |
| "The app works with mock data, deploy it" | Mock data in production = broken product. Real keys or don't deploy. |
| "I'll ask for all API keys at once" | Ask ONE AT A TIME with context — what it's for, where to get it. |
| "The user can set env vars later" | If the app crashes on launch because of missing keys, that's YOUR fault. Get them now. |
| "Test keys are fine for launch" | Only if the user explicitly chooses. Warn them. Default = real keys. |
| "I don't need to verify the connection" | A key can be wrong. Test each service connection before deploying. |
| "Smoke test is overkill for a simple app" | Simple apps break too. HTTP 200 check takes 5 seconds. |
| "Rollback instructions are boilerplate" | When production is down, boilerplate saves you. Write real steps. |
| "DNS will propagate eventually" | Verify DNS resolves NOW. Don't ship and hope. |
| "I'll set up monitoring later" | Document how to check if the app is healthy. Now. |
| "Environment variables are already set" | Verify them. A missing env var = a broken deploy. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Shown test report recommendation is "Ready to Launch" (show the line)
- [ ] Scanned for env vars and listed ALL required keys (show list)
- [ ] Scanned for mock/placeholder data and confirmed NONE remain (show scan output)
- [ ] Asked user for EACH missing API key via AskUserQuestion (show each key provided or skipped)
- [ ] Verified external service connections work (show test results)
- [ ] Run production build successfully (show build output)
- [ ] Deployed and shown the deploy output (show wrangler/API response)
- [ ] Run smoke tests and shown results (show HTTP status codes)
- [ ] Saved launch record (show the file path)
- [ ] Dispatched contract-validator and received PASS (show the result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| Deploy without test report | Verify "Ready to Launch" recommendation first |
| Skip smoke test | Always verify the app works after deploy |
| No rollback plan | Document exact rollback steps |
| Deploy to production on Friday evening | Deploy early in the week with monitoring time |
