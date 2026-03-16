---
name: design-doc
description: "Use when creating technical design documents from user stories. Triggers on: writing design docs, planning architecture, defining technical approach for user stories."
---

# Design Doc Writer

> **Pipeline auto-run mode:** If this skill was invoked automatically by the pipeline (after spark), skip ALL user approval steps. Choose the best architecture approach yourself and proceed. Complete the analysis, save the output, dispatch contract-validator, and immediately invoke the next skill upon PASS. Do NOT ask the user questions or wait for approval.

## Overview

Transform user stories into actionable technical design documents. Every user story MUST be covered by a design doc. No story left undesigned.

<HARD-GATE>
Before writing any design:
1. Extract ALL US-NNN from user stories → build Story Inventory
2. Group stories by domain → determine design doc split
3. Propose 2-3 architecture approaches with trade-offs
4. Get explicit user approval on the chosen approach
5. Write design docs ensuring 100% story coverage

All steps must complete. No story may be left without a design doc.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] User stories file exists at `docs/user-stories/*.md`
- [ ] File contains `## US-` story blocks
- [ ] Each referenced story has Priority, Size, Persona, Acceptance Criteria
- [ ] Requirements doc exists at `docs/requirements/*.md`

If validation fails, list specific violations and stop.

## Process

### 1. Story Inventory & Design Doc Split

Extract EVERY US-NNN from the user stories file. Then group by domain to determine design doc split:

```markdown
## Story Inventory

**Total stories:** [N]

### Domain Grouping

| Domain | Stories | Design Doc |
|--------|---------|------------|
| System (architecture, auth, shared) | US-001, US-002, ... | system-design.md |
| [Feature A] | US-010, US-011, ... | [feature-a]-design.md |
| [Feature B] | US-020, US-021, ... | [feature-b]-design.md |
| ... | ... | ... |

### Ungrouped Stories (MUST be zero)
[Any US-NNN not assigned to a design doc — fix before proceeding]
```

**Rules:**
- Every US-NNN must appear in exactly one design doc group
- The number of feature docs is driven by the number of distinct domains — no artificial cap
- Present the split to the user. Do NOT ask if they want to proceed — just show the plan and start writing.

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

### 3. Write Design Documents

After user approves an approach, write **all design docs** (1 system + N feature). Each is a production-grade blueprint — detailed enough that a developer with zero context can implement it.

**Required sections per design doc (never skip):**

- **Overview** — What this doc covers. List every US-NNN covered. Include success metrics from requirements.

- **Architecture** — System structure with clear diagram (ASCII or mermaid). Layer responsibilities. Request/response flow. State management. Deployment topology. *(System design doc only for global architecture; feature docs reference it.)*

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

- **UI/UX Design** — Page/screen inventory with US-NNN mapping. Navigation flow. Key interaction patterns. Responsive behavior. Loading/empty/error states for EVERY view. Accessibility requirements.

- **Error Handling** — Categorize errors (user error, system error, network error). Define error response format. User-facing messages. Logging strategy. Recovery procedures.

- **Security** — Authentication flow. Authorization model (roles, permissions). Input validation rules. Data encryption (at rest, in transit). CORS policy. CSP headers. Dependency audit.

- **Performance** — Target metrics (TTFB, LCP, CLS). Caching strategy. Lazy loading plan. Bundle size budget. Database query optimization.

- **Testing Strategy** — Per component: what to test, approach, fixtures needed. Coverage targets. E2E test scenarios mapped to user journeys. Performance test plan.

- **Deployment** — Cloudflare configuration. Environment variables list. Build pipeline. Rollback procedure. Monitoring and alerting.

### 4. Story Coverage Matrix

**After writing ALL design docs**, verify coverage:

```markdown
## Story Coverage Matrix

| US-NNN | Story Title | Priority | Design Doc | Covered? |
|--------|------------|----------|------------|----------|
| US-001 | User registration | High | system-design.md | YES |
| US-002 | OAuth login | High | system-design.md | YES |
| US-010 | Create dashboard | High | dashboard-design.md | YES |
| US-025 | Export CSV | Medium | data-design.md | YES |
| ... | ... | ... | ... | ... |

### Coverage Summary
- **High priority:** [X]/[Y] (must be 100%)
- **Medium priority:** [X]/[Y] (must be 100%)
- **Low priority:** [X]/[Y] (must be 100%)
- **Total:** [X]/[Y] ([Z]%)
```

**HARD RULE: 100% story coverage.** Every US-NNN must map to a design doc. If any story shows "NO", write or extend the relevant design doc NOW.

### 5. Save

Save each design doc to `docs/designs/YYYY-MM-DD-[topic]-design.md`.

Save the Story Coverage Matrix to `docs/designs/YYYY-MM-DD-[product]-story-coverage.md`.

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify:

```
Agent: contract-validator
Skill: design-doc
Output path: [all design doc files + story coverage matrix]
```

The validator will cross-check: read the user stories file, extract all US-NNN, and verify each one appears in the Story Coverage Matrix with a design doc assigned.

Do NOT proceed to frontend-design until the validator returns PASS. If it returns FAIL, fix the violations and re-validate.
Once the validator returns PASS, **immediately invoke `/frontend-design`** — do NOT ask the user whether to continue.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "The architecture is obvious, skip proposals" | Obvious to you ≠ obvious to the user. Present options. |
| "Only one approach makes sense" | Present it as recommended, but show at least one alternative. |
| "User stories are simple, no need to reference US-NNN" | Traceability is the whole point. Reference every story. |
| "Some stories don't need design" | Every story needs at least a mention in a design doc. No exceptions. |
| "Error handling can be figured out during impl" | Error handling designed late = error handling done badly. |
| "One big design doc is fine" | Split by domain. A 100-page doc is unreadable. |
| "100% coverage is overkill" | In regulated industries it's the law. For us it's the standard. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Extracted Story Inventory with ALL US-NNN (show count)
- [ ] Grouped stories into design doc domains (show grouping)
- [ ] Presented 2-3 approaches and received user choice (show the choice)
- [ ] Written all design docs — 1 system + N feature (show file paths)
- [ ] Built Story Coverage Matrix with 100% coverage (show matrix)
- [ ] Saved all files (show paths)
- [ ] Dispatched contract-validator and received PASS (show the result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "We'll use a modern architecture" | "Next.js app with Cloudflare Workers API, D1 database, R2 for assets" |
| "Components will communicate" | "OrderService calls InventoryService via REST; events via Cloudflare Queue" |
| "Handle errors appropriately" | "On payment failure: retry 3x with exponential backoff, then notify user and preserve cart" |
| One massive design doc | 1 system + N feature docs, split by domain |
| "20 of 30 stories covered" | "30/30 stories covered, 100% traceability" |
