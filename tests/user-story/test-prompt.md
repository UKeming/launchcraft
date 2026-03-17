# User Story Skill Test

## Input
Raw need: "Users complain they can't find the search bar on mobile devices"

## Expected Behavior
1. Skill asks clarifying questions (who are the users? what devices? what's the current search UX?)
2. Generates user stories in standard format: "As a [persona], I want [goal], so that [benefit]"
3. Each story has acceptance criteria
4. Stories are saved as individual files in domain folders (`.launchcraft/stories/[domain]/US-NNN-[slug].md`) with a global index at `.launchcraft/user-stories-index.md`
5. Stories are sized (small/medium/large) with priority

## Must NOT
- Generate stories without asking at least one clarifying question
- Produce vague acceptance criteria like "it should work well"
- Skip persona identification
