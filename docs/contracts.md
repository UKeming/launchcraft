# LaunchCraft Pipeline Contracts

Each skill validates its input on start and self-validates its output before saving.

## GLOBAL RULE: All pipeline .md files MUST be under `.launchcraft/`

**Every markdown artifact produced by any pipeline skill MUST be saved under the `.launchcraft/` directory in the target project.** No pipeline .md files may be saved to `docs/`, the project root, or any other location. This is validated by the contract-validator after every skill.

## Contract Definitions

### spark

**Input:** Raw idea, problem statement, or pasted feedback (free-form)
**Output:** `.launchcraft/requirements/YYYY-MM-DD-[product-name]-requirements.md`
**Output must contain:**
- Problem Statement (2-3 sentences)
- Target Users with Primary and Secondary personas
- Core Value Proposition (one sentence)
- Functional Requirements with Must Have / Should Have / Nice to Have tiers
- Non-Functional Requirements (performance, security, accessibility, platform)
- Business Model section (revenue model, paying customer, pricing reference)
- Growth & Distribution Strategy section (acquisition channel, viral/network effects, switching cost)
- Technical Architecture Indicators section (data entities, real-time needs, integrations, compliance)
- Competitive Landscape table with at least 3 entries
- Success Criteria (measurable)
- Out of Scope section
- Open Questions section (can be empty if all resolved)

### research

**Input:** Requirements doc from spark (`.launchcraft/requirements/*.md`)
**Output:** `.launchcraft/research/YYYY-MM-DD-[product-name]-research.md`
**Output must contain:**
- Assumptions table extracted from requirements (at least 3 assumptions)
- Market research with cited sources (at least 3 real sources)
- Expanded competitive analysis beyond spark's initial scan (pricing, reviews, gaps)
- **Feature Benchmark table**: each competitor's total feature count, categorized. Industry average feature count vs our current count. Gap number.
- **Competitor UI screenshots** saved to `.launchcraft/research/screenshots/[competitor-name]/` (at least 3 competitors, 3+ pages each)
- **UI Benchmark table**: UI patterns across competitors (global search, dark mode, keyboard shortcuts, etc.) with "We Should Have" column
- **Average competitor page count** with our target page count
- Assumption validation table with verdict and evidence per assumption
- Business model validation with competitor pricing data
- Growth channel research with evidence
- Regulatory & compliance landscape assessment
- Product-market fit assessment with evidence
- Requirement adjustments section (validated, added, deprioritized, or removed)
- Risk factors (market, technical, adoption, business model, regulatory)

### differentiation

**Input:** Requirements doc (`.launchcraft/requirements/*.md`) + Research report (`.launchcraft/research/*.md`)
**Output:** `.launchcraft/strategy/YYYY-MM-DD-[product-name]-differentiation.md`
**Output must contain:**
- Competitive feature matrix (capabilities vs competitors with gap analysis)
- Differentiation axes analysis (at least 4 axes explored, must include business model and growth)
- Positioning statement (For/Who/Our product/That/Unlike/We format)
- Strategic bets table (2-3 bets with rationale, risk, and validation signal)
- Requirement adjustments (elevate, add, deprioritize, keep-as-is sections)

### enhance

**Input:** Requirements doc (`.launchcraft/requirements/*.md`) + Research report (`.launchcraft/research/*.md`) + Differentiation strategy (`.launchcraft/strategy/*.md`)
**Output:** `.launchcraft/enhanced/YYYY-MM-DD-[product-name]-enhanced.md`
**Output must contain:**
- Enhancement record header with Date, Requirements Doc path, Research Report path, Differentiation Strategy path, Status
- Features Added table with feature name, tier (Must/Should/Nice), source, and rationale
- Differentiation Angles Added table
- User Story Opportunities Identified table with persona and journey stage
- Competitor Deep-Dive section with 3+ competitors' feature analysis
- Enhancement Metrics (features before/after, net additions)
- **Minimum feature count after enhance: Simple >= 35, Medium >= 50, Complex >= 70**
- Updated requirements doc at `.launchcraft/requirements/*.md` with approved features added

### frontend-design

**Input:** Domain design docs (`.launchcraft/*/design.md`) + Story files (`.launchcraft/*/stories/US-*.md`) + Index (`.launchcraft/user-stories-index.md`)
**Output:**
- Frontend code files (HTML/CSS/JS or framework components)
- `.launchcraft/frontend-design/YYYY-MM-DD-[product-name]-frontend-design.md`
**Output must contain:**
- Frontend design doc header with Date, Related Design Doc, Aesthetic Direction, Status
- Visual Direction section with aesthetic rationale
- Typography section with display + body font choices (NOT Inter, Roboto, or Arial)
- Color Palette section with primary, secondary, accent, background, text colors
- Page Inventory table matching design doc's UI/UX section
- **Minimum page count: Simple >= 8, Medium >= 12, Complex >= 18** (includes standard pages: landing, auth pages, dashboard, settings sub-pages, error pages, onboarding)
- Component Library listing reusable components
- Responsive Strategy section
- Pages Ready for Testing section with dev server command, base URL, and full page list
- Frontend-tester agent must have tested all pages and returned PASS

### user-story

**Input:** Requirements doc (`.launchcraft/requirements/*.md`) + Research report (`.launchcraft/research/*.md`) + Differentiation strategy (`.launchcraft/strategy/*.md`) + Enhancement record (`.launchcraft/enhanced/*.md`)
**Output:**
- `.launchcraft/[domain]/stories/US-NNN-[slug].md` — one file per story, organized by domain folder
- `.launchcraft/user-stories-index.md` — global feature inventory + coverage matrix + domain listing
**Output must contain:**
- Each story file has frontmatter: US-NNN, Title, Priority, Size, Persona, Features (F-NNN), Domain
- Each story file has: "As a..." statement, `## Acceptance Criteria` with Given/When/Then items
- Index file has: Feature Inventory (F-NNN numbered), Feature Coverage Matrix, Domain Listing with story counts
- Feature Coverage Matrix mapping every F-NNN to its US-NNN stories
- Must-Have feature coverage = 100% (every Must-Have feature mapped to ≥1 story)
- Should-Have feature coverage = 100%
- Nice-to-Have feature coverage ≥ 90%
- Stories cover: onboarding, core usage, error handling, settings
- Happy paths AND failure paths represented

### design-doc

**Input:** `.launchcraft/*/stories/US-*.md` (story files by domain) + `.launchcraft/user-stories-index.md` + `.launchcraft/requirements/*.md`
**Output:**
- `.launchcraft/[domain]/design.md` — one design doc per domain, co-located with its stories
- `.launchcraft/[domain]/assets/*` — generated image assets (if any IMAGE_REQUESTs)
- `.launchcraft/api-contract.yaml` — global OpenAPI 3.0 spec (single source of truth for all endpoints)
- `src/shared/api-types.ts` — shared TypeScript types for request/response (if TypeScript project)
- `.launchcraft/story-coverage.md` — global Story Coverage Matrix
**Output must contain:**
- Each design doc has file header: Title, Date, Domain, Related User Stories (US-NNN list), Status
- Each design doc has sections: Overview, Architecture, Components
- Each design doc has at least one of: Data Model, API Design
- Each design doc has sections: Error Handling, Security Considerations, Testing Strategy
- **API contract** (`.launchcraft/api-contract.yaml`) with all endpoints from all domains, OpenAPI 3.0 format
- Each domain's API Design section MUST be consistent with the global contract (same paths, same shapes)
- Story Coverage Matrix mapping every US-NNN to its domain's design doc
- 100% story coverage (every US-NNN assigned to a design doc)
- All IMAGE_REQUEST placeholders resolved (no remaining `<!-- IMAGE_REQUEST` blocks)
- Generated images verified (no garbled text in final assets)
- Real images meet `min_resolution` requirements
- `ATTRIBUTION.md` exists in every domain `assets/` folder that contains real (non-generated) images

### tdd-testing

**Input:** `.launchcraft/*/design.md` (domain design docs) + `.launchcraft/*/stories/US-*.md` (story files) + `.launchcraft/story-coverage.md`
**Output:**
- Test files in `tests/`
- `.launchcraft/test-plans/YYYY-MM-DD-[topic]-test-plan.md`
**Output must contain:**
- Test plan header with Title, Date, Related Design Docs, Related User Stories, Status, Story Coverage percentage
- Story Test Inventory listing every US-NNN with test type needed
- Test cases mapped to user stories (US-NNN references) and design docs
- Story → Test Coverage Matrix mapping every US-NNN to T-NNN test cases
- 100% story coverage (every US-NNN has at least one test)
- At least one executable test file created
- All tests must FAIL (red phase — no implementation yet)

### impl

**Input:**
- `.launchcraft/*/design.md` (domain design docs)
- `.launchcraft/api-contract.yaml` (API contract — single source of truth)
- `src/shared/api-types.ts` (shared types, if TypeScript)
- Test files in `tests/` (from tdd-testing)
**Output:** Implementation source code
**Output must satisfy:**
- All existing tests pass (green phase)
- Frontend API calls match `.launchcraft/api-contract.yaml` (same paths, same request/response shapes)
- Backend API handlers match `.launchcraft/api-contract.yaml`
- No test files modified (tests are the spec)
- Code follows design doc architecture

### experience-review

**Input:**
- All upstream docs: requirements (`.launchcraft/requirements/*.md`), domain stories (`.launchcraft/*/stories/US-*.md`), domain designs (`.launchcraft/*/design.md`), frontend design (`.launchcraft/frontend-design/*.md`)
- Locally deployed application (production build, NOT dev server — all tests must pass)
- Pipeline context log (`.launchcraft/pipeline-context.md`)
**Output:** `.launchcraft/experience-review/YYYY-MM-DD-[product-name]-experience-review.md`
**Output must contain:**
- Review Summary (total pages tested, journeys tested, issues found, iterations)
- Page-by-page results with screenshots (desktop + mobile) for every page
- User journey results for all core flows
- Feature Gap Analysis table (promised vs actual)
- Quality Standards Scorecard (7 categories, 1-5 scale each)
- Overall score >= 3.5, no individual score below 2
- Fixes Applied table (if any fixes were made during review)
- Iterations Log showing each review pass
- Final Verdict: APPROVED (required to proceed)
- If BACK-TO: must specify target stage and detailed reasoning

### test-report

**Input:** Test execution results (after experience-review) + domain stories (`.launchcraft/*/stories/US-*.md`) + domain designs (`.launchcraft/*/design.md`) + test plan
**Output:** `.launchcraft/test-reports/YYYY-MM-DD-[topic]-test-report.md`
**Output must contain:**
- File header with Title, Date, Related Test Plan, Status
- Summary: total tests, passed, failed, skipped
- Coverage metrics (if available)
- Results by User Story table (per-story pass/fail)
- Requirements Traceability Matrix (RTM): US-NNN → Design Doc → Page/Route → Test Cases → Pass/Fail
- RTM Summary with full traceability percentage
- Issues list (if any failures)
- Recommendation: ready to launch / needs fixes

### launch

**Input:**
- Passing test-report (recommendation must be "ready to launch")
- Built application code
- All required API keys provided by user (no placeholders, no mock data)
**Output:**
- Deployed to Cloudflare at `appX.keming.co`
- `.launchcraft/launches/YYYY-MM-DD-[topic]-launch.md`
**Output must contain:**
- File header with Title, Date, URL, Status
- Deployment details: platform, subdomain, timestamp
- Data audit results: env vars scanned, mock data check, keys configured
- API keys status table (key name, provided/skipped, service verified)
- Smoke test results
- Rollback instructions

### accountant (pre-planning)

**Input:** Requirements doc + Research report + Differentiation strategy + Enhancement record
**Output:** `.launchcraft/financials/YYYY-MM-DD-[product-name]-business-assessment.md`
**Output must contain:**
- Business Model section with pricing tiers table (actual prices, not placeholders)
- Cost Structure with itemized infrastructure costs (actual dollar amounts)
- Revenue Projections table with month 1, 3, 6, 12 (actual numbers)
- Break-Even Analysis with calculated break-even users and timeline
- Risk Assessment table with at least 3 risks
- Go/No-Go Recommendation (GO, CONDITIONAL GO, or NO-GO) with rationale
- All numbers must be filled in — no "$X" or "[N]" placeholders

### accountant (post-launch)

**Input:** All project docs + actual implementation (package.json, wrangler.toml, code)
**Output:** `.launchcraft/financials/YYYY-MM-DD-[product-name]-financial-report.md`
**Output must contain:**
- Actual Cost Breakdown based on real services used in code (not estimated — verified from implementation)
- Cost scaling table at 100, 1K, 10K, 100K users
- Feature-to-Tier mapping based on actual features built
- Updated 12-month projection with concrete numbers
- Unit Economics (LTV, CAC, LTV:CAC ratio, payback period, gross margin)
- Monetization Roadmap (immediate, short-term, medium-term)
- Financial Summary table with all key metrics filled in
- Verdict (PROFITABLE, VIABLE, NEEDS WORK, NOT VIABLE)
- All numbers must be filled in — no placeholders

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
