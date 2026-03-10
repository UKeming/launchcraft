---
name: design-doc
description: "Use when creating technical design documents from user stories. Triggers on: writing design docs, planning architecture, defining technical approach for user stories."
---

# Design Doc Writer

## Overview

Transform user stories into actionable technical design documents through collaborative architecture exploration. Always validate input, explore options, and get approval before writing.

<HARD-GATE>
Before writing any design:
1. Read and reference the user stories file — cite specific US-NNN numbers
2. Propose 2-3 architecture approaches with trade-offs
3. Get explicit user approval on the chosen approach

All three steps must complete before writing the detailed design.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] User stories file exists at `docs/user-stories/*.md`
- [ ] File contains `## US-` story blocks
- [ ] Each referenced story has Priority, Size, Persona, Acceptance Criteria
- [ ] Scope plan exists at `docs/plans/*-scope-plan.md`
- [ ] Requirements doc exists at `docs/requirements/*.md`

Read the scope plan's **Design Doc Plan** — it defines how many design docs to produce and what each covers. Follow that breakdown (1 system design + N feature designs). Do NOT write one monolithic doc.

If validation fails, list specific violations and stop.

## Process

### 1. Analyze User Stories

Read the user stories file. For each story, identify:
- Technical implications
- Shared components across stories
- Dependencies between stories
- Complexity drivers

Present a summary: "These N stories require [high-level technical summary]."

### 2. Propose Architecture Approaches

Present 2-3 approaches. For each:

```
### Approach [A/B/C]: [Name]

**How it works:** [2-3 sentences]
**Pros:** [bullet list]
**Cons:** [bullet list]
**Best for:** [when to choose this]
**Tech stack:** [key technologies]
```

Lead with your recommendation and explain why.

### 3. Write Design Document

After user approves an approach, write a **production-grade** design. This is the blueprint for a mature app — not a prototype. Every section must be detailed enough that a developer with zero context can implement it.

**Required sections (never skip):**

- **Overview** — What we're building, why, and for whom. Reference every US-NNN. Include success metrics from requirements doc.

- **Architecture** — System structure with clear diagram (ASCII or mermaid). Layer responsibilities. Request/response flow. State management strategy. Deployment topology.

- **Components** — For EACH component:
  - Responsibility (single responsibility)
  - Public interface (functions/methods with signatures)
  - Dependencies (what it imports/calls)
  - Internal behavior (key algorithms, state transitions)
  - Error states (what can go wrong, how it recovers)

- **Data Model** — Every entity with fields, types, constraints, relationships. Indexes for common queries. Migration strategy. Seed data for development.

- **API Design** — Every endpoint with:
  - Method, path, description
  - Request format (headers, body, params) with examples
  - Response format (success and error) with examples
  - Authentication/authorization requirements
  - Rate limiting

- **UI/UX Design** — Page/screen inventory. Navigation flow. Key interaction patterns. Responsive behavior. Loading/empty/error states for EVERY view. Accessibility requirements.

- **Error Handling** — Categorize errors (user error, system error, network error). Define error response format. User-facing messages. Logging strategy. Recovery procedures.

- **Security** — Authentication flow. Authorization model (roles, permissions). Input validation rules. Data encryption (at rest, in transit). CORS policy. CSP headers. Dependency audit.

- **Performance** — Target metrics (TTFB, LCP, CLS). Caching strategy. Lazy loading plan. Bundle size budget. Database query optimization.

- **Testing Strategy** — Per component: what to test, approach, fixtures needed. Coverage targets. E2E test scenarios mapped to user journeys. Performance test plan.

- **Deployment** — Cloudflare configuration. Environment variables list. Build pipeline. Rollback procedure. Monitoring and alerting.

### 4. Review

Present the design section by section. Ask after each: "Does this look right?" Iterate until approved. The goal is a design so thorough that implementation has no ambiguity.

### 5. Save

Save to `docs/designs/YYYY-MM-DD-[topic]-design.md` with this file structure:

```markdown
# Design: [Topic]

**Date:** YYYY-MM-DD
**Related User Stories:** docs/user-stories/[filename].md
**Status:** Draft | Reviewed | Approved
**Approach:** [Chosen approach name]

---

[Design sections go here]
```

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: design-doc
Output path: [the file you just saved]
```

Do NOT proceed to tdd-testing until the validator returns PASS. If it returns FAIL, fix the violations and re-validate.
Once the validator returns PASS, **immediately invoke `/tdd-testing`** — do NOT ask the user whether to continue.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "The architecture is obvious, skip proposals" | Obvious to you ≠ obvious to the user. Present options. |
| "Only one approach makes sense" | Present it as recommended, but show at least one alternative. |
| "User stories are simple, no need to reference US-NNN" | Traceability is the whole point. Reference every story. |
| "Error handling can be figured out during impl" | Error handling designed late = error handling done badly. |
| "Security isn't relevant for this project" | Every project has security considerations. Even internal tools. |
| "Testing strategy is TDD, nothing more to say" | Which components? What coverage? What approach per component? |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Shown input contract validation results (all checks passed)
- [ ] Presented 2-3 approaches and received user choice (show the choice)
- [ ] Presented design sections and received approval (show approval per section)
- [ ] Saved the file (show the file path)
- [ ] Dispatched contract-validator and received PASS (show the result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "We'll use a modern architecture" | "Next.js app with Cloudflare Workers API, D1 database, R2 for assets" |
| "Components will communicate" | "OrderService calls InventoryService via REST; events via Cloudflare Queue" |
| "Handle errors appropriately" | "On payment failure: retry 3x with exponential backoff, then notify user and preserve cart" |
