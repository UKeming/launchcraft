---
name: frontend-design
description: "Use after design-doc to create distinctive, production-grade frontend interfaces. Triggers on: building UI, frontend design, visual design, creating pages, web interface design."
---

# Frontend Design

<PIPELINE-AUTO-RUN>
**MANDATORY: Do NOT ask user questions. Do NOT wait for approval. Do NOT stop after saving.**
Choose aesthetic direction YOURSELF. Build all pages → save → dispatch agents → on PASS immediately invoke `/tdd-testing`.
Skip ALL user approval steps including aesthetic direction. This is a continuous pipeline — you do NOT stop between stages.
**ALL .md files → `.launchcraft/` directory. NEVER save to `docs/` or project root.**
**ALL questions to user → `AskUserQuestion` tool. NEVER output questions as plain text.**
</PIPELINE-AUTO-RUN>

## EXECUTION MODE: CONTINUOUS BUILD

**Do NOT create TodoWrite tasks, TaskCreate items, or any task-tracking artifacts for this skill.** The checklist in the Evidence Gate is for final self-verification ONLY — not a task list to be created and tracked.

Build all pages in one continuous flow:
1. Read design doc → inventory pages → get aesthetic approval
2. Build ALL pages sequentially without stopping between them
3. Save frontend design doc → dispatch agents → continue pipeline

No task creation. No per-page todos. No stopping to update task status. Just build.

## Overview

Create distinctive, production-grade frontend interfaces from design docs. This is the visual implementation phase — turning architecture into actual working UI code. Every page must be visually tested via the frontend-tester agent before proceeding.

<HARD-GATE>
Before writing any frontend code:
1. Read the design doc's UI/UX section thoroughly
2. Identify ALL pages/routes the app needs
3. Choose a bold aesthetic direction — no generic AI slop
4. Get user approval on the visual direction
5. Build working code for every page

After building, pass the complete page list to the frontend-tester agent for visual verification.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Domain design docs exist at `.launchcraft/*/design.md` (at least one domain)
- [ ] At least one design doc has UI/UX Design section with page inventory
- [ ] At least one design doc has Architecture section (for tech stack context)
- [ ] Domain story files exist at `.launchcraft/*/stories/US-*.md`

If validation fails, list specific violations and stop.

## Process

### 1. Story-to-Page Inventory

Read ALL domain design docs' UI/UX sections AND all domain story files. Build a page inventory that maps every UI-related story to a page:

```markdown
## Page Inventory

| # | Route | Page Name | Key Elements | User Stories |
|---|-------|-----------|-------------|-------------|
| 1 | / | Home | Hero, nav, CTA, features | US-001, US-002 |
| 2 | /login | Login | Form, OAuth, forgot link | US-003 |
| 3 | /dashboard | Dashboard | Sidebar, cards, charts | US-005, US-006 |

## UI Story Coverage

| US-NNN | Story Title | Page(s) | Covered? |
|--------|------------|---------|----------|
| US-001 | Landing page hero | / | YES |
| US-003 | User login | /login | YES |
| US-005 | Dashboard overview | /dashboard | YES |
| ... | ... | ... | ... |

**UI stories covered:** [X]/[Y] ([Z]%)
```

**Note:** Not all stories have UI (e.g., API-only, background jobs). Only stories with UI implications need page coverage. But every story WITH a UI component must map to at least one page.

Present to user: "These are all the pages I'll build. Missing anything?"

### 2. Choose Aesthetic Direction

Before coding, commit to a BOLD aesthetic direction. Consider:

- **Tone**: Pick an extreme — brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian
- **Differentiation**: What makes this UI UNFORGETTABLE? What's the one thing someone will remember?
- **Purpose**: What problem does this interface solve? Who uses it?

Present 2-3 visual directions with mood descriptions. Let the user choose.

**CRITICAL RULES:**
- NEVER use generic fonts (Inter, Roboto, Arial, system fonts)
- NEVER use cliche color schemes (purple gradients on white)
- NEVER use cookie-cutter layouts
- Choose distinctive, characterful fonts (pair a display font with a body font)
- Use CSS variables for consistent theming
- Commit fully to the chosen aesthetic — half-measures look worse than bold choices

### 3. Build Each Page

For each page in the inventory:

#### a. Structure (HTML/JSX)
- Semantic HTML with proper heading hierarchy
- ARIA labels for accessibility
- Responsive structure (mobile-first)

#### b. Styling (CSS/Tailwind)
- Cohesive with chosen aesthetic direction
- CSS variables for colors, fonts, spacing
- Responsive breakpoints (mobile, tablet, desktop)
- Loading, empty, and error states for EVERY view
- Hover states, focus states, transitions
- Dark mode support if appropriate

#### c. Interactions (JS/React)
- Smooth animations and micro-interactions
- Form validation with clear error messages
- Navigation transitions
- Loading indicators
- Keyboard navigation support

#### d. Visual Details
- Backgrounds: gradient meshes, noise textures, geometric patterns — NOT solid white
- Shadows: layered, contextual — NOT generic box-shadow
- Typography: proper line-height, letter-spacing, font-weight variation
- Spacing: intentional whitespace, visual rhythm
- Icons: consistent style, appropriate size

### 4. Create Page List for Testing

After building all pages, compile the complete test list:

```markdown
## Pages Ready for Testing

**Dev server command:** [e.g., npm run dev]
**Base URL:** [e.g., http://localhost:5173]

### Page List
1. `/` (Home) — hero section, navigation bar, CTA button, feature grid
2. `/login` (Login) — login form with email/password, OAuth buttons, forgot password link
3. `/dashboard` (Dashboard) — sidebar navigation, main content area, data cards, charts
4. `/settings` (Settings) — profile form, preferences toggles, danger zone
5. `/404` (Not Found) — custom error illustration, back to home link
```

### 5. Save Frontend Design Doc

Save to `.launchcraft/frontend-design/YYYY-MM-DD-[product-name]-frontend-design.md`:

```markdown
# Frontend Design: [Product Name]

**Date:** YYYY-MM-DD
**Related Design Docs:** .launchcraft/*/design.md
**Aesthetic Direction:** [chosen direction]
**Status:** Draft | Tested | Approved

## Visual Direction
[Description of the aesthetic choices and rationale]

## Typography
- **Display font:** [font name] — [why chosen]
- **Body font:** [font name] — [why chosen]
- **Monospace font:** [font name] (if applicable)

## Color Palette
- **Primary:** [color] — [usage]
- **Secondary:** [color] — [usage]
- **Accent:** [color] — [usage]
- **Background:** [color(s)]
- **Text:** [color(s)]

## Page Inventory
[Table from Step 1]

## Component Library
[List of reusable components created: buttons, cards, forms, modals, etc.]

## Responsive Strategy
[Breakpoints, mobile-first approach, layout changes per breakpoint]

## Animation & Motion
[Key animations, transitions, micro-interactions]

## Pages Ready for Testing
[Test list from Step 4]
```

## Output Validation

After saving, dispatch the **frontend-tester** agent to visually test every page:

```
Agent: frontend-tester
Page list: [the page list from Step 4]
Dev server command: [command]
Base URL: [URL]
Design doc: [path to frontend design doc]
```

The frontend-tester will open each page in Playwright, test at multiple breakpoints, check accessibility, and fix any visual issues.

After the frontend-tester returns with all pages PASS, dispatch the **contract-validator** agent:

```
Agent: contract-validator
Skill: frontend-design
Output path: [the frontend design doc + code files]
```

Do NOT proceed to tdd-testing until BOTH the frontend-tester and contract-validator return PASS.
Once both return PASS, run `echo "tdd-testing" > .launchcraft/.pipeline-next` then **immediately invoke `/tdd-testing`** — do NOT ask the user whether to continue.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "A clean white page with Inter font is fine" | That's AI slop. Choose a distinctive aesthetic. |
| "I'll skip the error/loading states" | Users see those states constantly. Design them. |
| "Responsive can wait" | 60%+ of traffic is mobile. Mobile-first, always. |
| "The tester agent is overkill" | Visual bugs in production cost trust. Test every page now. |
| "One page is enough to show the direction" | Build ALL pages. Partial frontends create gaps during impl. |
| "Accessibility isn't a priority" | Accessibility is a legal requirement and a quality signal. |
| "Dark mode is a nice-to-have" | If the design supports it, build it. Users expect it. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Listed all pages from design doc (show page inventory table)
- [ ] Presented 2-3 aesthetic directions and received user choice (show choice)
- [ ] Built working code for EVERY page (show file paths)
- [ ] Created responsive layouts at 3+ breakpoints (show evidence)
- [ ] Built loading, empty, and error states (show evidence)
- [ ] Compiled complete page list for testing (show list)
- [ ] Dispatched frontend-tester agent and received PASS for all pages (show report)
- [ ] Dispatched contract-validator and received PASS (show result)
- [ ] Saved frontend design doc (show path)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| White background, Inter font, blue buttons | Warm cream background, Fraunces serif, terracotta accent buttons |
| Generic card grid layout | Asymmetric bento grid with overlapping elements and depth |
| `box-shadow: 0 2px 4px rgba(0,0,0,0.1)` | Layered shadows with color tinting matching the palette |
| Placeholder text "Lorem ipsum" | Real content that matches the product's voice |
| Single desktop layout | Mobile-first with distinct layouts per breakpoint |
