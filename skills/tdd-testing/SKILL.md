---
name: tdd-testing
description: "Use when writing tests before implementation based on a design doc. Triggers on: writing tests first, TDD red phase, creating test plans, defining test cases from design."
---

# TDD Test Writer

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
- [ ] Design docs exist at `docs/designs/*.md`
- [ ] Design docs have: Overview, Architecture, Components sections
- [ ] Design docs reference user stories (US-NNN)
- [ ] User stories file exists at `docs/user-stories/*.md`
- [ ] Story Coverage Matrix exists at `docs/designs/*-story-coverage.md`

If validation fails, list specific violations and stop.

## Process

### 1. Story Inventory for Testing

Extract EVERY US-NNN from the user stories file. For each story, identify what needs testing:

```markdown
## Story Test Inventory

| US-NNN | Story Title | Priority | Test Type Needed | Design Doc |
|--------|------------|----------|-----------------|------------|
| US-001 | User registration | High | Unit + Integration | system-design.md |
| US-002 | OAuth login | High | Unit + Integration + E2E | system-design.md |
| US-010 | Create dashboard | High | Unit + E2E | dashboard-design.md |
| ... | ... | ... | ... | ... |

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

### 4. Write Test Files

For each test case, write actual executable test code:
- Use the project's test framework (detect from package.json, pyproject.toml, etc.)
- If no framework exists, recommend one and set it up
- Each test must have a clear name describing the expected behavior
- Use Given/When/Then structure in test names or comments
- Include setup/teardown as needed
- **Add US-NNN reference in test name or comment** for traceability

Example:
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

### 5. Verify All Tests Fail

Run the test suite. Every test must fail with a clear reason (missing function, missing module, etc.). If any test passes, investigate — it means either:
- The test is wrong (doesn't test real behavior)
- There's already an implementation (should not exist yet)

### 6. Save Test Plan

Save to `docs/test-plans/YYYY-MM-DD-[topic]-test-plan.md`:

```markdown
# Test Plan: [Topic]

**Date:** YYYY-MM-DD
**Related Design Docs:** [list all design doc paths]
**Related User Stories:** docs/user-stories/[filename].md
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

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify:

```
Agent: contract-validator
Skill: tdd-testing
Output path: [test plan file and test directory]
```

The validator will:
1. Run all tests and confirm they FAIL
2. Cross-check: read user stories, extract all US-NNN, verify each appears in the Story → Test Coverage Matrix with at least one T-NNN

Do NOT proceed until the validator returns PASS.

After contract-validator PASS, dispatch the **code-reviewer** agent to review test code quality:

```
Agent: code-reviewer
Skill: tdd-testing
Code paths: tests/
Design doc: docs/designs/[filename].md
```

The code-reviewer will check test quality, coverage completeness, and auto-fix any issues. All tests must still FAIL after fixes.

Once the code-reviewer completes, **immediately invoke `/impl`** — do NOT ask the user whether to continue.

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
