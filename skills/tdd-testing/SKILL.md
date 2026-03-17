---
name: tdd-testing
description: "Use when writing tests before implementation based on a design doc. Triggers on: writing tests first, TDD red phase, creating test plans, defining test cases from design."
---

# TDD Test Writer

<PIPELINE-AUTO-RUN>
**MANDATORY: Do NOT ask user questions. Do NOT wait for approval. Do NOT stop after saving.**
Write tests (parallel by domain) → save test plan → dispatch contract-validator + code-reviewer → on PASS call Skill tool: Skill(skill='impl').
This is a continuous pipeline — you do NOT stop between stages.
**ALL .md files → `.launchcraft/` directory. NEVER save to `docs/` or project root.**
**ALL questions to user → `AskUserQuestion` tool. NEVER output questions as plain text.**
</PIPELINE-AUTO-RUN>

## Overview

Write failing tests and a test plan from design documents. This is the RED phase of TDD — tests define the spec, implementation comes later. Every user story MUST have at least one test. No story left untested.

<HARD-GATE>
Before writing any test:
1. Extract ALL US-NNN from user stories → build Story Inventory
2. Read ALL design docs and map components to stories
3. Create test plan with Story → Test Coverage Matrix
4. Write executable tests for every story
5. Verify ALL tests FAIL

All tests must FAIL after this skill completes. If any test passes, something is wrong — there should be no implementation yet.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Domain design docs exist at `.launchcraft/*/design.md` (at least one domain)
- [ ] Each design doc has: Overview, Architecture, Components sections
- [ ] Each design doc references user stories (US-NNN)
- [ ] Domain story files exist at `.launchcraft/*/stories/US-*.md`
- [ ] Story Coverage Matrix exists at `.launchcraft/story-coverage.md`

If validation fails, list specific violations and stop.

## Process

### 1. Story Inventory for Testing

Read ALL story files from `.launchcraft/*/stories/US-*.md` and the story coverage matrix from `.launchcraft/story-coverage.md`. For each story, identify what needs testing:

```markdown
## Story Test Inventory

| US-NNN | Story Title | Priority | Test Type Needed | Domain | Design Doc |
|--------|------------|----------|-----------------|--------|------------|
| US-001 | User registration | High | Unit + Integration | system | .launchcraft/system/design.md |
| US-002 | OAuth login | High | Unit + Integration + E2E | auth | .launchcraft/auth/design.md |
| US-010 | Create dashboard | High | Unit + E2E | dashboard | .launchcraft/dashboard/design.md |
| ... | ... | ... | ... | ... | ... |

**Total stories:** [N]
**Stories needing tests:** [N] (should be ALL of them)
```

### 2. Create Test Plan

For each design doc, map components to test cases:

```markdown
## Test Plan

### Unit Tests
| T-NNN | Test Name | Component | User Story | Design Doc |
|-------|-----------|-----------|------------|------------|
| T-001 | [test name] | [component] | US-001 | system-design.md |
| T-002 | [test name] | [component] | US-001 | system-design.md |

### Integration Tests
| T-NNN | Test Name | Flow | User Stories | Design Doc |
|-------|-----------|------|-------------|------------|
| T-050 | [test name] | [flow] | US-001, US-002 | system-design.md |

### E2E Tests
| T-NNN | Test Name | User Journey | User Stories |
|-------|-----------|-------------|-------------|
| T-100 | [test name] | [journey] | US-001, US-002, US-003 |

### Edge Case Tests
| T-NNN | Test Name | Scenario | User Story |
|-------|-----------|----------|------------|
| T-150 | [test name] | [scenario] | US-005 |
```

### 3. Story → Test Coverage Matrix

**This is the guarantee that every story gets tested.**

```markdown
## Story → Test Coverage Matrix

| US-NNN | Story Title | Priority | Test Cases | Covered? |
|--------|------------|----------|-----------|----------|
| US-001 | User registration | High | T-001, T-002, T-050, T-100 | YES |
| US-002 | OAuth login | High | T-003, T-004, T-050 | YES |
| US-010 | Create dashboard | High | T-020, T-101 | YES |
| US-025 | Export CSV | Medium | — | **NO** |
| ... | ... | ... | ... | ... |

### Coverage Summary
- **High priority:** [X]/[Y] (must be 100%)
- **Medium priority:** [X]/[Y] (must be 100%)
- **Low priority:** [X]/[Y] (must be 100%)
- **Total:** [X]/[Y] ([Z]%)
```

**HARD RULE: 100% story coverage.** Every US-NNN must map to at least one T-NNN. If any story shows "NO", write tests for it NOW.

### 4. Write Test Files — PARALLELIZE BY DESIGN DOC (Worktree Isolation)

**This step MUST use parallel agents in isolated worktrees for speed and conflict safety.**

First, set up the test framework and shared test infrastructure (config, helpers, fixtures) and **commit it** — this becomes the base that each worktree agent starts from.

Then:

1. **Group test cases by domain** — each domain folder has its own design doc + stories
2. **Dispatch one `tdd-test-writer` sub-agent per domain** (parallel, each in its own worktree)
3. **Merge all worktree branches** into main, resolving any conflicts

```
┌──────────────────────────────────────────────┐
│  Set up test framework + shared config       │
│  git commit (base for all worktrees)         │
└──────────────┬───────────────────────────────┘
               ▼
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Worktree│ │Worktree│ │Worktree│
│ Agent: │ │ Agent: │ │ Agent: │
│ Tests  │ │ Tests  │ │ Tests  │
│ for    │ │ for    │ │ for    │
│ doc 1  │ │ doc 2  │ │ doc 3  │
│(branch │ │(branch │ │(branch │
│  wt-1) │ │  wt-2) │ │  wt-3) │
└────┬───┘ └────┬───┘ └────┬───┘
     └──────────┼──────────┘
                ▼
┌──────────────────────────────────────────────┐
│  Merge: git merge wt-1 wt-2 wt-3 into main  │
│  If conflicts → resolve (see Merge Protocol) │
└──────────────┬───────────────────────────────┘
               ▼
        Run full suite → all tests must FAIL
```

**Dispatching parallel sub-agents:**

```
Agent(subagent_type="tdd-test-writer") per domain, ALL in one message:
  - prompt: "Domain: [domain], Design doc: .launchcraft/[domain]/design.md,
             Stories: US-NNN to US-NNN, T-NNN range: T-001 to T-020,
             Test framework: [vitest/jest/pytest]"
  - run_in_background: true (except the last one)
```

**Each worktree agent receives:**
- The domain's design doc (`.launchcraft/[domain]/design.md`)
- The domain's story files (`.launchcraft/[domain]/stories/US-*.md`)
- The test framework config and shared helpers (already committed)
- Instructions to write executable failing tests with US-NNN + T-NNN references
- **Must commit its work before finishing** (so the branch has the changes)

**Each agent writes (in its own worktree):**
- Test files for its domain (e.g., `tests/auth.test.ts`, `tests/dashboard.test.ts`)
- Must use Given/When/Then structure
- Must reference US-NNN in test names or comments

Example test structure:
```javascript
// US-001: User registration
describe('User Registration', () => {
  test('T-001: should create account with valid email and password', () => {
    // Given a valid email and password
    // When the user submits the registration form
    // Then a new account is created
  });
});
```

**After all agents complete — Merge Protocol:**

1. Collect all worktree branches returned by agents
2. For each branch, merge into the current branch:
   ```bash
   git merge <worktree-branch> --no-edit
   ```
3. **If merge succeeds cleanly:** continue to next branch
4. **If merge conflicts:**
   - Read the conflicting files
   - Resolve conflicts intelligently (both sides are test files for different domains — usually keep both)
   - `git add` resolved files → `git commit`
5. After all branches merged: run full test suite → all tests must FAIL
6. Clean up worktree branches: `git branch -d <worktree-branch>`

**If there is only ONE domain**, write tests directly without worktrees (overhead not worth it).

### 5. Verify All Tests Fail

Run the full test suite. Every test must fail with a clear reason (missing function, missing module, etc.). If any test passes, investigate — it means either:
- The test is wrong (doesn't test real behavior)
- There's already an implementation (should not exist yet)

### 6. Save Test Plan

Save to `.launchcraft/test-plans/YYYY-MM-DD-[topic]-test-plan.md`:

```markdown
# Test Plan: [Topic]

**Date:** YYYY-MM-DD
**Related Design Docs:** [list all design doc paths]
**Related User Stories:** .launchcraft/*/stories/US-*.md
**Status:** Red (all tests failing)
**Test Framework:** [framework name]
**Total Test Cases:** [N]
**Story Coverage:** [X]/[Y] ([Z]%)

---

## Story Test Inventory
[From Step 1]

## Test Cases
[From Step 2]

## Story → Test Coverage Matrix
[From Step 3]
```

## Output Validation — Dispatch Agents in PARALLEL

After saving, dispatch **both agents simultaneously**:

**Dispatch in parallel:**

1. **contract-validator** (foreground) — runs tests, confirms they FAIL, cross-checks story coverage
2. **code-reviewer** (background) — checks test quality, coverage completeness, auto-fixes issues

```
Agent: contract-validator
Skill: tdd-testing
Output path: [test plan file and test directory]
```

```
Agent: code-reviewer (run_in_background: true)
Skill: tdd-testing
Code paths: tests/
Design doc: .launchcraft/*/design.md
```

Wait for both to complete. If code-reviewer made fixes, re-run tests to verify they still FAIL (no accidental implementation).

Once both complete, run `echo "impl" > .launchcraft/.pipeline-next` then **call the Skill tool: `Skill(skill='impl')`** — do NOT ask the user whether to continue.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "I'll write tests and implementation together, faster" | TDD means RED first. Write ALL tests before ANY implementation. |
| "This test is too trivial to write" | Trivial tests catch trivial bugs that waste hours. Write it. |
| "Not every story needs a test" | EVERY story needs a test. That's what the coverage matrix is for. |
| "I know the tests will fail, no need to run them" | Run them. A test that passes when it shouldn't is a bad test. |
| "Edge cases can be tested later" | Edge cases found in production cost 10x more. Test now. |
| "80% coverage is good enough" | 100% story coverage. Non-negotiable. |
| "Low-priority stories can skip tests" | Low-priority stories still have acceptance criteria. Test them. |
| "I'll write all tests sequentially, it's simpler" | If there are 2+ domains, dispatch parallel worktree agents. Speed matters. |
| "Parallel test writing will cause conflicts" | Each agent runs in its own worktree. Merge afterward — conflicts are rare for test files in different domains. |
| "Worktrees are overkill for tests" | Agents might touch shared files (test config, fixtures, helpers). Worktrees make this safe. |
| "Let me run contract-validator first, then code-reviewer" | Dispatch both in parallel. They don't depend on each other. |
| "I'll merge the worktree branches later" | Merge immediately after all agents complete. Don't defer. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Extracted Story Inventory with ALL US-NNN (show count)
- [ ] Created test plan with test cases mapped to stories (show plan)
- [ ] Built Story → Test Coverage Matrix with 100% coverage (show matrix)
- [ ] Created executable test files with US-NNN references (show file paths)
- [ ] Run all tests and shown they ALL FAIL (show test output with failure count)
- [ ] Saved test plan (show the file path)
- [ ] Dispatched contract-validator and received PASS (show the result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| `test_it_works()` | `test_search_returns_results_for_valid_query()` |
| Testing implementation details | Testing behavior and outcomes |
| Mocking everything | Mock external dependencies only |
| No assertion message | `assert result == expected, "Search should return 10 results for 'shoes'"` |
| No US-NNN reference in tests | Every test file/block references the story it tests |
| "20 of 30 stories have tests" | "30/30 stories covered, 100% traceability" |
| Writing all tests in one long sequential pass | Parallel worktree agents per domain, merge branches |
| Running validators sequentially | Dispatch contract-validator + code-reviewer in parallel |
| Parallel agents writing to same working directory | Each agent in `isolation: "worktree"`, merge after |
