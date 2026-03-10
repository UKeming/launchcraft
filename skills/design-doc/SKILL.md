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

If validation fails, list specific violations and stop. Do NOT proceed with invalid input.

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

After user approves an approach, write the full design covering these sections (scale each to its complexity — skip if genuinely not applicable):

- **Overview** — What we're building and why (reference US-NNN)
- **Architecture** — System structure, key decisions, diagrams if helpful
- **Components** — Each component with responsibility, interfaces, dependencies
- **Data Model** — Entities, relationships, storage (if applicable)
- **API Design** — Endpoints, request/response formats (if applicable)
- **Error Handling** — Failure modes, recovery strategies, user-facing errors
- **Security Considerations** — Auth, input validation, data protection
- **Testing Strategy** — What to test, approach per component, coverage goals

### 4. Review

Present the design section by section. Ask after each: "Does this look right?"

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

Do NOT proceed to the next pipeline stage until the validator returns PASS. If it returns FAIL, fix the violations and re-validate.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "We'll use a modern architecture" | "Next.js app with Cloudflare Workers API, D1 database, R2 for assets" |
| "Components will communicate" | "OrderService calls InventoryService via REST; events via Cloudflare Queue" |
| "Handle errors appropriately" | "On payment failure: retry 3x with exponential backoff, then notify user and preserve cart" |
