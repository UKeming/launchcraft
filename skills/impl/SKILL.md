---
name: impl
description: "Use when implementing code to make failing tests pass, guided by a design doc. Triggers on: implementing features, writing production code, making tests green, TDD green phase."
---

# Implementation

<PIPELINE-AUTO-RUN>
**MANDATORY: Do NOT ask user questions. Do NOT wait for approval. Do NOT stop after saving.**
Implement (parallel by dependency layer) → run tests → dispatch contract-validator + code-reviewer → on PASS call Skill tool: Skill(skill='experience-review').
This is a continuous pipeline — you do NOT stop between stages.
**ALL .md files → `.launchcraft/` directory. NEVER save to `docs/` or project root.**
**ALL questions to user → `AskUserQuestion` tool. NEVER output questions as plain text.**
</PIPELINE-AUTO-RUN>

## Overview

Write the minimum code to make all failing tests pass, following the design doc architecture. This is the GREEN phase of TDD. When all tests pass, every user story has been implemented (because every story has tests, and every test maps to a story).

<HARD-GATE>
Before writing any implementation code:
1. Read ALL design docs and understand the architecture
2. Read the test plan's Story → Test Coverage Matrix
3. Run all tests and confirm they FAIL (red phase complete)
4. Plan implementation order by component dependency

Do NOT modify any test files. Tests are the spec.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Domain design docs exist at `.launchcraft/designs/*/design.md` (at least one domain)
- [ ] Test files exist in `tests/`
- [ ] Test plan exists at `.launchcraft/test-plans/*.md`
- [ ] Test plan has Story → Test Coverage Matrix with 100% story coverage
- [ ] All tests currently FAIL (red phase is complete)

If validation fails, list specific violations and stop.

## Process

### 1. Build Execution Plan — Dependency Graph with Parallelism

Read the test plan and design docs. Build a **layered dependency graph** to maximize parallel execution:

```markdown
## Implementation Plan

### Dependency Graph (layers execute in order, components within a layer execute in PARALLEL)

**Layer 0 — No dependencies (foundational):**
- [Component A] → T-001, T-002 → US-001
- [Component B] → T-003, T-004 → US-002
- [Component C] → T-005 → US-003
→ ALL 3 implemented in PARALLEL via Agent tool

**Layer 1 — Depends on Layer 0:**
- [Component D] → depends on A → T-010, T-011 → US-005, US-006
- [Component E] → depends on B → T-020, T-021 → US-010
→ BOTH implemented in PARALLEL via Agent tool

**Layer 2 — Depends on Layer 0 + 1:**
- [Component F] → depends on A, D, E → T-030 → US-015
→ Sequential (single component)

### Progress Tracker
| Layer | Component | Depends On | Tests to Pass | Stories | Status |
|-------|-----------|-----------|--------------|---------|--------|
| 0 | [A] | — | T-001, T-002 | US-001 | PENDING |
| 0 | [B] | — | T-003, T-004 | US-002 | PENDING |
| 0 | [C] | — | T-005 | US-003 | PENDING |
| 1 | [D] | A | T-010, T-011 | US-005 | PENDING |
| 1 | [E] | B | T-020, T-021 | US-010 | PENDING |
| 2 | [F] | A, D, E | T-030 | US-015 | PENDING |
```

**Key rule:** Components in the SAME layer have NO dependencies on each other → they MUST be parallelized.

### 2. Implement Layer by Layer — PARALLELIZE WITHIN LAYERS (Worktree Isolation)

Each parallel agent runs in its own **git worktree** (`isolation: "worktree"`). This prevents file conflicts when multiple agents write code simultaneously. After each layer's agents complete, their branches are **merged** into main.

```
Layer 0: Parallel worktree agents for each independent component
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Worktree│ │Worktree│ │Worktree│
│ Comp A │ │ Comp B │ │ Comp C │
│(branch │ │(branch │ │(branch │
│ wt-a)  │ │ wt-b)  │ │ wt-c)  │
└────┬───┘ └────┬───┘ └────┬───┘
     └──────────┼──────────┘
                ▼
     Merge wt-a, wt-b, wt-c → resolve conflicts
                ▼
     Run tests → verify Layer 0 tests pass
                ▼
Layer 1: Parallel worktree agents for next batch
    ┌──────────┼──────────┐
    ▼          ▼
┌────────┐ ┌────────┐
│Worktree│ │Worktree│
│ Comp D │ │ Comp E │
└────┬───┘ └────┬───┘
     └──────────┘
                ▼
     Merge → resolve conflicts → run tests
                ▼
Layer 2: Sequential (single component, no worktree needed)
                ▼
     Run FULL test suite
```

**For each layer:**

1. **Before dispatching:** commit current state — this is the base for worktree agents
2. **If multiple components: dispatch parallel `impl-worker` sub-agents** — all in one message:
   ```
   Agent(subagent_type="impl-worker") per component, ALL in one message:
     - prompt: "Component: [X], Tests: T-NNN to T-NNN,
                Design doc: .launchcraft/[domain]/design.md,
                API contract: .launchcraft/api-contract.yaml,
                Shared types: src/shared/api-types.ts (if exists),
                Stories: US-NNN"
     - run_in_background: true (except the last one)
   ```
3. **If single component: implement directly** — no worktree overhead
4. **After all agents return: Merge Protocol** (see below)
5. **Run tests** — verify this layer's tests pass AND no previous tests broke
6. **If tests fail: fix in main context** — don't re-dispatch agents for minor fixes
7. **Update Progress Tracker** — mark layer as DONE, commit

**Each worktree agent receives:**
- The component it's responsible for
- Its test files (what behavior to implement)
- Its design doc section (what architecture to follow)
- The current codebase state (including all prior layers — committed before dispatch)
- **Must commit its work before finishing** (so the branch has the changes)

**Each worktree agent rules:**
- Reads the relevant tests → understands expected behavior
- Reads the design doc section → understands architecture
- Writes minimal code to make those tests pass
- Does NOT modify test files
- Does NOT implement anything outside its component scope
- **Commits all changes before finishing**

**Merge Protocol (after each layer):**

1. Collect all worktree branches returned by agents
2. For each branch, merge into the current branch:
   ```bash
   git merge <worktree-branch> --no-edit
   ```
3. **If merge succeeds cleanly:** continue to next branch
4. **If merge conflicts:**
   - Read the conflicting files carefully
   - Resolve by combining both sides (both are implementing different components — usually additive)
   - For shared files (e.g., `index.ts` re-exports, route definitions, config):
     - Keep BOTH additions (both components need their exports/routes)
     - Verify imports/references are correct
   - `git add` resolved files → `git commit`
5. After all branches merged: run tests for this layer
6. Clean up worktree branches: `git branch -d <worktree-branch>`

**Common conflict patterns and resolutions:**

| Conflict Location | Resolution |
|-------------------|-----------|
| Route/router file (both add routes) | Keep both route additions |
| Index/barrel export file | Keep both export lines |
| Config file (both add entries) | Merge both config entries |
| Shared utility (both modify) | Combine changes, verify no contradiction |
| Package.json dependencies | Keep union of both dependency sets, re-run `npm install` |
| Database schema/migration | Order migrations correctly, verify no column conflicts |

**When NOT to parallelize:**
- Single design doc with tightly coupled components → implement sequentially
- Fewer than 3 components total → overhead not worth it
- All components depend on each other → forced sequential

### 3. Verify All Tests Pass

After all layers are implemented:
- Run the full test suite
- Every test must PASS
- If any test fails, fix the implementation (not the test)

### 4. Story Implementation Verification

After all tests pass, verify the traceability chain is complete:

```markdown
## Story Implementation Verification

| US-NNN | Story Title | Tests | All Pass? | Implemented? |
|--------|------------|-------|-----------|-------------|
| US-001 | User registration | T-001, T-002, T-050 | YES | YES |
| US-002 | OAuth login | T-003, T-004 | YES | YES |
| ... | ... | ... | ... | ... |

**All tests pass:** YES
**All stories implemented:** [X]/[Y] (must be 100%)
```

This verification proves: every story → has tests → tests pass → story is implemented.

### 5. Refactor (Optional)

If the code works but could be cleaner:
- Refactor only with user approval
- Run tests after each refactor to ensure nothing breaks
- Keep refactoring commits separate from feature commits

## Output Validation — Dispatch Agents in PARALLEL

After implementation is complete, dispatch **both agents simultaneously**:

```
┌──────────────────────┐
│  All tests pass      │
└──────────┬───────────┘
           ▼
  ┌────────┼────────┐
  ▼                 ▼
┌──────────┐  ┌──────────────┐
│ contract │  │ code-reviewer │
│ validator│  │ (background)  │
│ (fg)     │  │               │
└────┬─────┘  └──────┬───────┘
     │               │
     ▼               ▼
  Must PASS      Auto-fixes
     │           + re-runs tests
     └────────┬──────┘
              ▼
     Both complete → continue
```

**Dispatch in parallel:**

1. **contract-validator** (foreground) — runs tests, checks no test files modified, verifies code structure
2. **code-reviewer** (background) — checks design adherence, security, code quality, auto-fixes issues

```
Agent: contract-validator
Skill: impl
Output path: [project root]
```

```
Agent: code-reviewer (run_in_background: true)
Skill: impl
Code paths: [source code directories]
Design doc: .launchcraft/designs/*/design.md
```

Wait for both to complete. If code-reviewer made fixes, re-run tests to verify they still pass.

Once both complete and all tests pass, run `echo "experience-review" > .launchcraft/.pipeline-next` then **call the Skill tool: `Skill(skill='experience-review')`** — do NOT ask the user whether to continue.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "This test is wrong, I need to fix it" | Tests are the spec. Fix your code, not the test. |
| "I'll add this extra feature while I'm here" | YAGNI. Implement what the tests require. Nothing more. |
| "One big commit is fine for a small change" | One commit per component. Always. |
| "I don't need to run the full suite after each component" | One broken component can cascade. Run full suite every time. |
| "I'll refactor as I go" | GREEN first, REFACTOR second. Separate concerns. |
| "The tests pass locally, should be fine" | Show the output. Evidence beats assumptions. |
| "Parallel agents are too complex for this" | If there are 2+ independent components in the same layer, parallelize. No excuses. |
| "I'll implement everything sequentially, it's simpler" | Simpler for YOU, slower for the user. Build the dependency graph and parallelize. |
| "Let me run contract-validator first, then code-reviewer" | Dispatch both in parallel. They don't depend on each other. |
| "Worktrees are overkill, agents can write to the same repo" | Parallel writes to shared files = conflicts. Worktrees prevent this. Always use `isolation: "worktree"`. |
| "I'll merge later, let me implement first" | Merge after EACH layer. Don't stack up N branches — merge early, catch conflicts early. |
| "This merge conflict is too hard to resolve" | Parallel agents write different components. Conflicts are almost always additive (both add routes/exports). Keep both sides. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Built Execution Plan with component order and story mapping (show plan)
- [ ] Run tests before implementation and shown they ALL FAIL (show output)
- [ ] Implemented all components with progress tracker updated (show tracker)
- [ ] Run full test suite and shown ALL PASS (show output)
- [ ] Built Story Implementation Verification with 100% coverage (show table)
- [ ] Shown git log proving commits per component
- [ ] Dispatched contract-validator and received PASS (show the result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| Writing more code than tests require | Writing minimum code to pass tests |
| Modifying tests to match implementation | Fixing implementation to match tests |
| One giant commit | One commit per component |
| Implementing features not in design doc | Sticking to the spec |
| Premature optimization | Make it work, then make it right |
| "Tests pass, done" | "Tests pass AND Story Implementation Verification shows 100%" |
| Implementing 10 components sequentially | Dependency graph → 3 layers → parallel worktree agents per layer |
| Running contract-validator then code-reviewer | Dispatching both in parallel |
| Parallel agents writing to same repo | Each agent in `isolation: "worktree"`, merge branches after |
| Skipping merge, hoping no conflicts | Merge after each layer, resolve conflicts immediately |
