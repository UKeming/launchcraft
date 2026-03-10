# LaunchCraft Pipeline Contracts

Each skill validates its input on start and self-validates its output before saving.

## Contract Definitions

### spark

**Input:** Raw idea, problem statement, or pasted feedback (free-form)
**Output:** `docs/requirements/YYYY-MM-DD-[product-name]-requirements.md`
**Output must contain:**
- Problem Statement (2-3 sentences)
- Target Users with Primary and Secondary personas
- Core Value Proposition (one sentence)
- Functional Requirements with Must Have / Should Have / Nice to Have tiers
- Non-Functional Requirements (performance, security, accessibility, platform)
- Competitive Landscape table with at least 3 entries
- Success Criteria (measurable)
- Out of Scope section
- Open Questions section (can be empty if all resolved)

### research

**Input:** Requirements doc from spark (`docs/requirements/*.md`)
**Output:** `docs/research/YYYY-MM-DD-[product-name]-research.md`
**Output must contain:**
- Assumptions table extracted from requirements (at least 3 assumptions)
- Market research with cited sources (at least 3 real sources)
- Expanded competitive analysis beyond spark's initial scan (pricing, reviews, gaps)
- Assumption validation table with verdict and evidence per assumption
- Product-market fit assessment with evidence
- Requirement adjustments section (validated, added, deprioritized, or removed)
- Risk factors (market, technical, adoption)

### differentiation

**Input:** Requirements doc (`docs/requirements/*.md`) + Research report (`docs/research/*.md`)
**Output:** `docs/strategy/YYYY-MM-DD-[product-name]-differentiation.md`
**Output must contain:**
- Competitive feature matrix (capabilities vs competitors with gap analysis)
- Differentiation axes analysis (at least 3 axes explored)
- Positioning statement (For/Who/Our product/That/Unlike/We format)
- Strategic bets table (2-3 bets with rationale, risk, and validation signal)
- Requirement adjustments (elevate, add, deprioritize, keep-as-is sections)

### scope-planning

**Input:** Requirements doc (`docs/requirements/*.md`) + Research report (`docs/research/*.md`) + Differentiation strategy (`docs/strategy/*.md`)
**Output:** `docs/plans/YYYY-MM-DD-[product-name]-scope-plan.md`
**Output must contain:**
- Complexity Analysis table with scores and rationale per factor
- Complexity classification (Simple / Medium / Complex)
- User Story Plan with target count per persona per journey stage
- Design Doc Plan listing 1 system + N feature docs with scope
- Implementation Modules with dependency order

### user-story

**Input:** Scope plan (`docs/plans/*-scope-plan.md`) + Requirements doc (`docs/requirements/*.md`)
**Output:** `docs/user-stories/YYYY-MM-DD-[topic].md`
**Output must contain:**
- File header with Title, Date, Source, Status
- At least 3 `## US-NNN:` blocks per persona
- Each story has: Priority, Size, Persona, "As a..." statement
- Each story has `### Acceptance Criteria` with Given/When/Then items
- Stories cover: onboarding, core usage, error handling, settings
- Happy paths AND failure paths represented

### design-doc

**Input:** `docs/user-stories/*.md` (must exist and pass user-story contract)
**Output:** `docs/designs/YYYY-MM-DD-[topic]-design.md`
**Output must contain:**
- File header with Title, Date, Related User Stories, Status
- Sections: Overview, Architecture, Components
- At least one of: Data Model, API Design
- Sections: Error Handling, Security Considerations, Testing Strategy

### tdd-testing

**Input:** `docs/designs/*.md` (must exist and pass design-doc contract)
**Output:**
- Test files in `tests/`
- `docs/test-plans/YYYY-MM-DD-[topic]-test-plan.md`
**Output must contain:**
- Test plan header with Title, Date, Related Design Doc, Status
- Test cases mapped to user stories (US-NNN references)
- At least one executable test file created
- All tests must FAIL (red phase — no implementation yet)

### impl

**Input:**
- `docs/designs/*.md` (design doc)
- Test files in `tests/` (from tdd-testing)
**Output:** Implementation source code
**Output must satisfy:**
- All existing tests pass (green phase)
- No test files modified (tests are the spec)
- Code follows design doc architecture

### test-report

**Input:** Test execution results (after impl)
**Output:** `docs/test-reports/YYYY-MM-DD-[topic]-test-report.md`
**Output must contain:**
- File header with Title, Date, Related Test Plan, Status
- Summary: total tests, passed, failed, skipped
- Coverage metrics (if available)
- Per-test results with pass/fail status
- Issues list (if any failures)
- Recommendation: ready to launch / needs fixes

### launch

**Input:**
- Passing test-report (recommendation must be "ready to launch")
- Built application code
**Output:**
- Deployed to Cloudflare at `appX.keming.co`
- `docs/launches/YYYY-MM-DD-[topic]-launch.md`
**Output must contain:**
- File header with Title, Date, URL, Status
- Deployment details: platform, subdomain, timestamp
- Smoke test results
- Rollback instructions

## Validation Protocol

**On skill start:**
1. Check input files exist
2. Validate input matches upstream contract
3. If validation fails: list specific violations, do NOT proceed

**Before skill save:**
1. Run output through contract checklist
2. Every required field must be present
3. If validation fails: show what's missing, fix before saving

## Rollback Protocol

If a downstream skill finds upstream issues:
1. Log the issue with specific contract violation
2. Notify the user: "[skill] found issues with [upstream skill] output: [details]"
3. User decides: fix upstream and re-run, or override and continue
