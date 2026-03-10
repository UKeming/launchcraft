---
name: tdd-testing
description: "Use when writing tests before implementation based on a design doc. Triggers on: writing tests first, TDD red phase, creating test plans, defining test cases from design."
---

# TDD Test Writer

## Overview

Write failing tests and a test plan from a design document. This is the RED phase of TDD — tests define the spec, implementation comes later.

<HARD-GATE>
Before writing any test:
1. Read and reference the design doc — cite specific sections
2. Map test cases to user stories (US-NNN)
3. Confirm test approach with user

All tests must FAIL after this skill completes. If any test passes, something is wrong — there should be no implementation yet.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Design doc exists at `docs/designs/*.md`
- [ ] Design doc has: Overview, Architecture, Components sections
- [ ] Design doc references user stories (US-NNN)
- [ ] Design doc has a Testing Strategy section

If validation fails, list specific violations and stop.

## Process

### 1. Analyze Design Doc

Read the design doc. For each component, identify:
- What behaviors need testing
- Edge cases from Error Handling section
- Security scenarios from Security Considerations
- Integration points between components

### 2. Create Test Plan

Present the test plan to the user:

```markdown
## Test Plan

### Unit Tests
- [Component]: [what to test] → maps to US-NNN
- [Component]: [what to test] → maps to US-NNN

### Integration Tests
- [Flow]: [what to test] → maps to US-NNN

### Edge Cases
- [Scenario]: [expected behavior]
```

Ask: "Does this cover everything? Anything to add or remove?"

### 3. Write Test Files

For each test case, write actual executable test code:
- Use the project's test framework (detect from package.json, pyproject.toml, etc.)
- If no framework exists, recommend one and get approval
- Each test must have a clear name describing the expected behavior
- Use Given/When/Then structure in test names or comments
- Include setup/teardown as needed

### 4. Verify All Tests Fail

Run the test suite. Every test must fail with a clear reason (missing function, missing module, etc.). If any test passes, investigate — it means either:
- The test is wrong (doesn't test real behavior)
- There's already an implementation (should not exist yet)

### 5. Save Test Plan

Save to `docs/test-plans/YYYY-MM-DD-[topic]-test-plan.md`:

```markdown
# Test Plan: [Topic]

**Date:** YYYY-MM-DD
**Related Design Doc:** docs/designs/[filename].md
**Status:** Red (all tests failing)
**Test Framework:** [framework name]
**Total Test Cases:** [N]

---

## Test Cases

### Unit Tests

| ID | Test | Component | User Story | Status |
|----|------|-----------|------------|--------|
| T-001 | [test name] | [component] | US-NNN | FAIL |

### Integration Tests

| ID | Test | Flow | User Story | Status |
|----|------|------|------------|--------|
| T-NNN | [test name] | [flow] | US-NNN | FAIL |

### Edge Cases

| ID | Test | Scenario | Status |
|----|------|----------|--------|
| T-NNN | [test name] | [scenario] | FAIL |
```

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: tdd-testing
Output path: [test plan file and test directory]
```

The validator will run all tests and confirm they FAIL. Do NOT proceed to impl until the validator returns PASS. If it returns FAIL, fix the violations and re-validate.

## Anti-Patterns

| Bad | Good |
|-----|------|
| `test_it_works()` | `test_search_returns_results_for_valid_query()` |
| Testing implementation details | Testing behavior and outcomes |
| Mocking everything | Mock external dependencies only |
| No assertion message | `assert result == expected, "Search should return 10 results for 'shoes'"` |
