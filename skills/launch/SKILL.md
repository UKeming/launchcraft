---
name: launch
description: "Use when deploying a completed and tested application to Cloudflare. Triggers on: deploying to production, launching an app, going live, publishing to Cloudflare."
---

# Launch to Cloudflare

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
- [ ] Test report exists at `docs/test-reports/*.md`
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

### 2. Build

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

Save to `docs/launches/YYYY-MM-DD-[topic]-launch.md`:

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

- User Stories: docs/user-stories/[file].md
- Design Doc: docs/designs/[file].md
- Test Report: docs/test-reports/[file].md

## Rollback Instructions

If issues are found after launch:

1. Run: `wrangler rollback` or redeploy previous version
2. Verify rollback at https://[app-name].keming.co
3. Update this document Status to "Rolled Back"
4. Create issue in docs/issues/ describing the problem
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
| "Smoke test is overkill for a simple app" | Simple apps break too. HTTP 200 check takes 5 seconds. |
| "Rollback instructions are boilerplate" | When production is down, boilerplate saves you. Write real steps. |
| "DNS will propagate eventually" | Verify DNS resolves NOW. Don't ship and hope. |
| "I'll set up monitoring later" | Document how to check if the app is healthy. Now. |
| "Environment variables are already set" | Verify them. A missing env var = a broken deploy. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Shown test report recommendation is "Ready to Launch" (show the line)
- [ ] Received user go/no-go for deployment (show confirmation)
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
