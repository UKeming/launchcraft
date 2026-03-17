---
name: design-doc
description: "Use when creating technical design documents from user stories. Triggers on: writing design docs, planning architecture, defining technical approach for user stories."
---

# Design Doc Writer

<PIPELINE-AUTO-RUN>
**MANDATORY: Do NOT ask user questions. Do NOT wait for approval. Do NOT stop after saving.**
Choose the best architecture approach YOURSELF. Write design docs (parallel by domain) → save → dispatch contract-validator → on PASS call Skill tool: Skill(skill='frontend-design').
Skip ALL user approval steps. This is a continuous pipeline — you do NOT stop between stages.
**ALL .md files → `.launchcraft/` directory. NEVER save to `docs/` or project root.**
**ALL questions to user → `AskUserQuestion` tool. NEVER output questions as plain text.**
</PIPELINE-AUTO-RUN>

<CRITICAL-OUTPUT-RULES>
## OUTPUT FORMAT & PARALLELIZATION — READ THIS FIRST

**Each domain gets its own `design.md` co-located with its stories:**
- `.launchcraft/[domain]/design.md` — one file per domain
- `.launchcraft/story-coverage.md` — global coverage matrix

**Parallelization is MANDATORY when there are 2+ feature domains:**
1. Write `system` domain design doc FIRST (in main context) → commit
2. Dispatch ALL feature domain design docs as **parallel worktree agents** (`isolation: "worktree"`)
3. Merge branches after all complete

**Do NOT write all design docs sequentially.** If you have auth, dashboard, and settings domains, dispatch 3 parallel agents — one per domain. Sequential writing when parallel is possible is a bug.
</CRITICAL-OUTPUT-RULES>

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
- [ ] Domain story folders exist at `.launchcraft/*/stories/US-*.md` (at least one domain with stories)
- [ ] Global index exists at `.launchcraft/user-stories-index.md`
- [ ] Each story file has frontmatter: id, title, priority, size, persona, features, domain
- [ ] Each story file has Acceptance Criteria section
- [ ] Requirements doc exists at `.launchcraft/requirements/*.md`

If validation fails, list specific violations and stop.

## Process

### 1. Story Inventory & Domain Verification

Stories are already organized by domain folders (from user-story skill). Read ALL story files from `.launchcraft/*/stories/US-*.md` and the global index at `.launchcraft/user-stories-index.md`.

Verify the domain structure:

```markdown
## Story Inventory (from domain folders)

**Total stories:** [N]

### Domain Mapping

| Domain | Folder | Stories | Design Doc |
|--------|--------|---------|------------|
| system | .launchcraft/system/stories/ | US-001, US-002, ... | .launchcraft/system/design.md |
| [Domain A] | .launchcraft/[domain-a]/stories/ | US-010, US-011, ... | .launchcraft/[domain-a]/design.md |
| [Domain B] | .launchcraft/[domain-b]/stories/ | US-020, US-021, ... | .launchcraft/[domain-b]/design.md |
| ... | ... | ... | ... |

### Ungrouped Stories (MUST be zero)
[Any US-NNN not in a domain folder — fix before proceeding]
```

**Rules:**
- Every US-NNN must belong to exactly one domain folder
- Each domain folder gets exactly one design doc (`design.md`) co-located with its stories
- The domain structure is inherited from user-story output — do NOT reorganize domains
- Present the inventory to the user. Do NOT ask if they want to proceed — just show the plan and start writing.

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

### 3. Write Design Documents — PARALLELIZE BY DOMAIN (Worktree Isolation)

After user approves an approach, write all design docs in parallel using worktree agents.

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
  - **All endpoint definitions MUST match the global API contract** (`.launchcraft/api-contract.yaml`). If your domain adds new endpoints, add them to the contract first.

- **UI/UX Design** — Page/screen inventory with US-NNN mapping. Navigation flow. Key interaction patterns. Responsive behavior. Loading/empty/error states for EVERY view. Accessibility requirements. **Where a visual asset is needed (illustrations, icons, hero images, diagrams), insert an IMAGE_REQUEST placeholder** (see format below).

- **Error Handling** — Categorize errors (user error, system error, network error). Define error response format. User-facing messages. Logging strategy. Recovery procedures.

- **Security** — Authentication flow. Authorization model (roles, permissions). Input validation rules. Data encryption (at rest, in transit). CORS policy. CSP headers. Dependency audit.

- **Performance** — Target metrics (TTFB, LCP, CLS). Caching strategy. Lazy loading plan. Bundle size budget. Database query optimization.

- **Testing Strategy** — Per component: what to test, approach, fixtures needed. Coverage targets. E2E test scenarios mapped to user journeys. Performance test plan.

- **Deployment** — Cloudflare configuration. Environment variables list. Build pipeline. Rollback procedure. Monitoring and alerting.

#### Parallelization Flow

```
┌──────────────────────────────────────────────────┐
│  Write system domain design doc FIRST            │
│  (architecture, shared infra, auth, deployment)  │
│  git commit (base for all worktrees)             │
└──────────────┬───────────────────────────────────┘
               ▼
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Worktree│ │Worktree│ │Worktree│
│ Agent: │ │ Agent: │ │ Agent: │
│ Domain │ │ Domain │ │ Domain │
│ A      │ │ B      │ │ C      │
│ design │ │ design │ │ design │
│ .md    │ │ .md    │ │ .md    │
└────┬───┘ └────┬───┘ └────┬───┘
     └──────────┼──────────┘
                ▼
     Merge branches → resolve conflicts
                ▼
     Image Asset Generation (Step 3.5)
```

**System design doc first:** Write the system domain's `.launchcraft/system/design.md` directly (no worktree needed — it's the foundation).

**Then generate the global API contract** from the system design's API section. Save to `.launchcraft/api-contract.yaml` (OpenAPI 3.0 format). This is the **single source of truth** for all endpoints. For TypeScript projects, also generate `src/shared/api-types.ts` with request/response types that both frontend and backend will import.

**Commit both** (system design + API contract) — this is the base for all worktree agents.

**Feature domains in parallel:** Dispatch one **`design-doc-writer`** sub-agent per feature domain:

```
Agent(subagent_type="design-doc-writer") per feature domain, ALL in one message:
  - prompt: "Domain: [domain], Stories: US-NNN to US-NNN,
             System design: .launchcraft/system/design.md,
             API contract: .launchcraft/api-contract.yaml,
             Architecture: [chosen approach]"
  - run_in_background: true (except the last one)
```

**Each worktree agent receives:**
- The system design doc (already committed)
- The domain's story files (`.launchcraft/[domain]/stories/US-*.md`)
- The requirements doc
- The architecture approach chosen by the user
- Instructions to write `.launchcraft/[domain]/design.md` with all required sections
- **Must insert IMAGE_REQUEST placeholders** where visual assets are needed
- **Must commit its work before finishing**

**If there is only ONE feature domain**, write directly — no worktree overhead.

**After all agents complete — Merge Protocol:**
Same as tdd-testing/impl: merge each worktree branch, resolve conflicts (keep both sides for different domains), commit.

#### IMAGE_REQUEST Placeholder Format

When a design doc needs a visual asset, the agent inserts a placeholder. There are two types: **generated** (AI-created) and **real** (sourced from web search).

```markdown
<!-- IMAGE_REQUEST
id: [unique-id, e.g., img-auth-flow]
type: generated | real
description: [detailed description of what the image should show]
has_text: true | false          (generated only)
aspect_ratio: [e.g., 16:9, 1:1, 4:3]
min_resolution: [e.g., 1920x1080, 1200x800]  (real only — minimum acceptable resolution)
purpose: [what this image is for in the design]
search_terms: [comma-separated keywords]      (real only — web search terms)
license: [e.g., free, CC0, commercial-ok]     (real only — acceptable license type)
-->
![Alt text](.launchcraft/[domain]/assets/[filename].png)
```

**When to use `type: generated`:**
- Illustrations, icons, abstract visuals, custom graphics, conceptual diagrams
- UI mockups, decorative patterns, branded assets
- Anything that doesn't exist in the real world

**When to use `type: real`:**
- Product photos, real-world scenes, stock photography
- Screenshots of real software/websites (for competitive reference)
- Maps, satellite imagery, real data visualizations
- Photos of people, objects, places, food, nature, etc.
- Any image where AI-generated would look uncanny or fake

**Rules for generated IMAGE_REQUESTs:**
- `has_text: true` — only if the image MUST contain readable text (labels, button text, headings)
- `has_text: false` — for illustrations, icons, abstract visuals, patterns
- Prefer `has_text: false` — text in generated images is often unreliable
- **No transparent backgrounds** — nano-banana cannot generate transparent PNGs. Design around this (use solid or gradient backgrounds).

**Rules for real IMAGE_REQUESTs:**
- `min_resolution` is required — specify the minimum width×height needed for the use case:
  - Hero/banner images: `1920x1080` minimum
  - Card thumbnails: `800x600` minimum
  - Full-width section backgrounds: `2560x1440` minimum
  - Inline content images: `1200x800` minimum
  - Icons/avatars: `512x512` minimum
- `search_terms` — provide 2-4 specific keywords for web search (e.g., "cozy coffee shop interior warm lighting")
- `license` — specify acceptable license. Default to `free` (no attribution required). Use `CC0` for public domain. Use `commercial-ok` for commercial projects.
- Always verify the found image actually matches the description — not just the search terms

**General rules (both types):**
- Keep descriptions detailed but focused on visual elements, not abstract concepts
- One IMAGE_REQUEST per image — don't combine multiple distinct visuals

### 3.5. Image Asset Generation

**After all design docs are written and merged**, the main agent processes all image requests. There are two pipelines: **generated** (AI via nano-banana MCP) and **real** (web search + download). Both run in parallel.

#### a. Collect & Classify Image Requests

Scan ALL design docs (`.launchcraft/*/design.md`) for `<!-- IMAGE_REQUEST ... -->` blocks. Split into two lists:

```markdown
## Image Manifest

### Generated Images (AI)

| # | ID | Domain | Has Text | Model | Aspect | Est. Cost |
|---|-----|--------|----------|-------|--------|-----------|
| 1 | img-auth-flow | auth | no | nano-banana | 16:9 | ~$0.01 |
| 2 | img-dashboard-hero | dashboard | yes | nano-banana-pro | 16:9 | ~$0.05 |

### Real Images (Web Search)

| # | ID | Domain | Min Resolution | Search Terms | License |
|---|-----|--------|---------------|-------------|---------|
| 3 | img-coffee-hero | landing | 1920x1080 | cozy coffee shop warm lighting | free |
| 4 | img-team-photo | about | 1200x800 | diverse tech team office | CC0 |

**Generated:** [X] images, estimated ~$[A.AA]
**Real:** [Y] images, $0 (web search)
**Total:** [N] images
```

#### b. Budget Notification

**Before generating or searching**, notify the user:

```
"I found [N] image requests across [M] design docs.
 Generated (AI):
   - [X₁] without text → nano-banana (~$0.01 each)
   - [X₂] with text → nano-banana-pro (~$0.05 each)
 Real (web search):
   - [Y] images → free (web search + download)
 Estimated total: ~$[Z.ZZ]
 Proceed?"
```

Wait for user confirmation before proceeding.

#### c. Pipeline 1: Generated Images (AI)

**Model Selection:**

| Image Type | Model | Why |
|-----------|-------|-----|
| No text (illustrations, icons, patterns) | `nano-banana` | Cheapest, text quality irrelevant |
| Contains text (UI mockups with labels) | `nano-banana-pro` | Best text rendering, fewer garbled characters |

**Generate — Parallel:**

Call the nano-banana MCP `generate_image` tool. **All generated images in parallel** (multiple MCP calls in one message):

```
For EACH generated image:
  generate_image(
    prompt: [description from IMAGE_REQUEST],
    model: [selected model],
    aspect_ratio: [from IMAGE_REQUEST],
    output_dir: ".launchcraft/[domain]/assets",
    filename: [id from IMAGE_REQUEST]
  )
```

#### d. Pipeline 2: Real Images (Web Search)

**The main agent handles real image sourcing directly** — this cannot be delegated to worktree agents because it requires WebSearch + WebFetch tools and visual judgment.

For EACH real image request:

1. **Search** — Use WebSearch with the `search_terms` from the IMAGE_REQUEST:
   ```
   WebSearch: "[search_terms] free high resolution photo"
   ```
   Look for results from known free image sources (Unsplash, Pexels, Pixabay, Wikimedia Commons, etc.) or any source matching the `license` requirement.

2. **Evaluate candidates** — Check at least 3 results:
   - Does the image match the `description`? (not just the search terms)
   - Does the resolution meet `min_resolution`? **This is a hard requirement.** If the image is smaller than the minimum, skip it.
   - Is the license compatible? (check the source site's license terms)

3. **Download** — Use WebFetch or Bash (`curl`) to download the chosen image to `.launchcraft/[domain]/assets/[filename].[ext]`.

4. **Record attribution** — Save a `.launchcraft/[domain]/assets/ATTRIBUTION.md` file:
   ```markdown
   # Image Attribution

   | File | Source | License | Original URL |
   |------|--------|---------|-------------|
   | img-coffee-hero.jpg | Unsplash / @photographer | Unsplash License | https://... |
   ```

**Resolution requirements (hard minimums):**

| Use Case | Min Resolution | Notes |
|----------|---------------|-------|
| Hero / banner / full-width background | 1920×1080 | 2560×1440 preferred for retina |
| Section background | 1920×1080 | |
| Inline content image | 1200×800 | |
| Card thumbnail | 800×600 | |
| Avatar / icon | 512×512 | |
| Mobile-only image | 750×1334 | iPhone viewport |

**If no suitable image is found** (wrong resolution, bad license, no good match):
1. Note it in the manifest as UNFOUND
2. Fall back to `type: generated` — generate an illustration instead using nano-banana
3. Add a comment in the design doc: `<!-- NOTE: Real image not found, using generated illustration -->`

**Real images can be searched in parallel** — dispatch multiple WebSearch calls in one message. But the evaluate + download steps are sequential per image (need to see results before downloading).

#### e. Verify ALL Images — Parallel Agents

After both pipelines complete, dispatch **one verification agent per image** (generated AND real) to check quality:

```
Agent tool call (parallel, one per image):
  - prompt: "Read the image at [path]. Check:
             1. Does it match this description: [description]?
             2. For generated: any garbled/unreadable text?
             3. For real: is resolution at least [min_resolution]? Is it the right subject?
             4. Overall quality — is it usable in a production design?
             Return: PASS, FAIL_TEXT (garbled text), FAIL_RESOLUTION (too small), or FAIL_QUALITY (bad image)"
  - run_in_background: true (except last)
```

**Each verification agent:**
1. Reads the image file (Claude Code can read images)
2. Checks visual match against description
3. **For generated images:** specifically checks for garbled text — misspelled words, illegible characters, nonsense strings
4. **For real images:** verifies resolution meets minimum, subject matches description, no watermarks
5. Returns a verdict: PASS, FAIL_TEXT, FAIL_RESOLUTION, or FAIL_QUALITY

#### f. Handle Failures

**FAIL_TEXT (generated, garbled text):**
1. Regenerate with the SAME description + "DO NOT include any text, words, letters, or labels in the image"
2. Switch model to `nano-banana` (cheaper — text no longer needed)
3. Re-verify. Max 2 retries per image. If still failing, the no-text version is final.

**FAIL_RESOLUTION (real, too small):**
1. Search again with resolution-specific terms: `"[search_terms] high resolution 4K"`
2. Try alternative sources (different stock photo sites)
3. If no high-res version exists: fall back to `type: generated`

**FAIL_QUALITY (either type):**
1. For generated: regenerate with a more detailed prompt
2. For real: search again with refined terms
3. Max 2 retries. If still failing, note as placeholder in design doc.

#### g. Update Design Docs

After all images are verified (or retried):
1. For each IMAGE_REQUEST block, replace the placeholder path with the actual image path
2. Remove the `<!-- IMAGE_REQUEST ... -->` comment blocks
3. If a generated image was retried without text, update the alt text
4. If a real image was substituted with generated, note this in the alt text
5. Ensure `ATTRIBUTION.md` exists in every domain's `assets/` folder that has real images

### 4. Story Coverage Matrix

**After writing ALL design docs**, verify coverage:

```markdown
## Story Coverage Matrix

| US-NNN | Story Title | Priority | Design Doc | Covered? |
|--------|------------|----------|------------|----------|
| US-001 | User registration | High | .launchcraft/system/design.md | YES |
| US-002 | OAuth login | High | .launchcraft/auth/design.md | YES |
| US-010 | Create dashboard | High | .launchcraft/dashboard/design.md | YES |
| US-025 | Export CSV | Medium | .launchcraft/data/design.md | YES |
| ... | ... | ... | ... | ... |

### Coverage Summary
- **High priority:** [X]/[Y] (must be 100%)
- **Medium priority:** [X]/[Y] (must be 100%)
- **Low priority:** [X]/[Y] (must be 100%)
- **Total:** [X]/[Y] ([Z]%)
```

**HARD RULE: 100% story coverage.** Every US-NNN must map to a design doc. If any story shows "NO", write or extend the relevant design doc NOW.

### 5. Save — Co-located with Stories

Save each domain's design doc directly into its domain folder:

- `.launchcraft/[domain]/design.md` — one design doc per domain, co-located with `stories/`

Save the global Story Coverage Matrix:

- `.launchcraft/story-coverage.md` — maps every US-NNN to its domain's design doc

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify:

```
Agent: contract-validator
Skill: design-doc
Output path: [all design doc files + story coverage matrix]
```

The validator will cross-check: read the user stories file, extract all US-NNN, and verify each one appears in the Story Coverage Matrix with a design doc assigned.

Do NOT proceed to frontend-design until the validator returns PASS. If it returns FAIL, fix the violations and re-validate.
Once the validator returns PASS, run `echo "frontend-design" > .launchcraft/.pipeline-next` then **call the Skill tool: `Skill(skill='frontend-design')`** — do NOT ask the user whether to continue.

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
| "I'll write all domains sequentially" | System first, then all feature domains in PARALLEL via worktree agents. |
| "Images can be added later" | If the design needs a visual, request it now. Placeholders get forgotten. |
| "I'll put text in the image, it'll be fine" | Text in generated images is often garbled. Default to `has_text: false` unless text is essential. |
| "I'll generate images one at a time" | Generate all in parallel. Budget the user first, then batch. |
| "The garbled text is close enough" | Garbled text is worse than no text. Regenerate without text. |
| "I need transparent backgrounds" | Nano-banana cannot do transparent PNGs. Use solid/gradient backgrounds. Design around this. |
| "I'll skip the budget notification" | The user must approve image spending before generation. Always notify. |
| "AI-generated photos of people look fine" | They don't. Use `type: real` for photos of people, places, objects. AI is for illustrations and graphics. |
| "Any resolution is fine for a hero image" | Hero images need 1920×1080 minimum. Low-res images look terrible on retina displays. Check `min_resolution`. |
| "I'll just use the first search result" | Evaluate at least 3 candidates. Check resolution, license, and visual match. |
| "Attribution isn't important" | Real images need attribution tracked in `ATTRIBUTION.md`. License violations are legal risk. |
| "The real image is close enough to the description" | Close enough = wrong. If the image doesn't match, search again or fall back to generated. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Extracted Story Inventory with ALL US-NNN (show count)
- [ ] Grouped stories into design doc domains (show grouping)
- [ ] Presented 2-3 approaches and received user choice (show the choice) — **auto-chosen in pipeline auto-run**
- [ ] Written system design doc first, then feature domains in parallel (show file paths)
- [ ] If IMAGE_REQUESTs exist: shown budget to user, generated images, verified each one (show manifest + results)
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
