---
name: interview
description: "Deep-dive interview covering 9 domains before spark. Optional — for users who want maximum specification depth. Produces a comprehensive spec that feeds into /spark."
---

# Interview — Deep-Dive Specification Interview

> **Pipeline auto-run mode:** This skill is optional and always user-initiated. It does NOT participate in the automatic pipeline flow. After completion, it calls `/spark` with the interview results as context.

## Overview

Conduct an exhaustive 40+ question interview across 9 technical and product domains. The goal is to surface decisions, constraints, edge cases, and risks the user hasn't thought about yet. The output is a comprehensive specification document that feeds directly into spark, giving it a massive head start.

## CRITICAL RULES

1. **Every single question MUST use the AskUserQuestion tool.** Never output a question as plain text. Every question must have structured options (including an "Other / Let me explain" free-text option).
2. **Ask ONE question at a time.** Do not batch questions. Wait for the answer before asking the next.
3. **Questions must be NON-OBVIOUS.** Do not ask "what do you want to build?" — the user already told you. Ask things they haven't considered.
4. **Adapt based on answers.** If the user says "no real-time features," skip the real-time follow-ups. If they mention compliance, go deeper on security.
5. **Track domain completion.** Show progress after each domain (e.g., "Domain 3/9: Error Handling — complete").

## Input

Accepts:
- A product idea or concept (e.g., "I want to build a bookmark manager")
- Optionally, existing notes, requirements, or context

## Process

### 1. Acknowledge and Set Expectations

Tell the user:
- This is a deep-dive interview (~40 questions across 9 domains)
- It will take 10-15 minutes
- The output will be a comprehensive spec fed directly into /spark
- They can say "skip" to any question or "skip domain" to jump ahead

### 2. Conduct Interview — 9 Domains

For EVERY question below, use `AskUserQuestion` with thoughtful options. Adapt follow-ups based on answers. Skip questions that become irrelevant based on prior answers.

---

#### Domain 1: Technical Implementation (5+ questions)

Uncover architecture decisions the user may not have considered.

- What is the expected data volume at launch vs. 12 months out? (< 1K records, 1K-100K, 100K-1M, 1M+, unsure)
- Should the system work offline or is always-online acceptable? (always online, offline-first with sync, progressive — works degraded offline, unsure)
- Do you need multi-tenancy (one DB per customer, shared DB with row-level isolation, single-tenant, unsure)?
- What is your deployment preference? (serverless/edge like Cloudflare Workers, container-based like Docker/K8s, traditional VM, managed PaaS like Vercel/Railway, unsure)
- Do you need background job processing (email queues, scheduled tasks, data pipelines)? (yes — critical, nice to have, no, unsure)
- What is the expected API style? (REST, GraphQL, tRPC, gRPC, no API needed, unsure)
- Do you need file uploads? If so, what types and size limits? (images only < 5MB, documents < 50MB, large files > 50MB, video, no uploads, unsure)

#### Domain 2: Architecture (5+ questions)

Uncover structural decisions that are expensive to change later.

- Should the frontend and backend be a monolith or separate deployments? (monolith/full-stack framework, separate SPA + API, micro-frontends, unsure)
- Do you need a real-time data layer (WebSockets, SSE, polling)? (real-time collaboration like Google Docs, live notifications/updates, polling is fine, no real-time needed, unsure)
- What is your caching strategy preference? (CDN + edge caching, in-memory like Redis, browser-only caching, no caching needed yet, unsure)
- Do you need event sourcing or audit trails (tracking every change, not just current state)? (full event sourcing, simple audit log, soft deletes only, no history needed, unsure)
- How should the system handle multi-region? (single region is fine, multi-region for latency, multi-region for compliance/data residency, unsure)
- Do you need a plugin or extension system? (yes — core to product, nice to have later, no, unsure)

#### Domain 3: Error Handling (4+ questions)

Uncover resilience requirements most people skip until production.

- What happens when a third-party API is down (e.g., payment provider, email service)? (queue and retry, show degraded state, block the operation, unsure)
- Do you need automatic retry logic with backoff? (yes — for all external calls, only for critical paths like payments, no — fail fast, unsure)
- How should the system handle partial failures in multi-step operations? (saga pattern with compensation, show partial success, rollback everything, unsure)
- What is your error notification strategy? (real-time alerts like PagerDuty/Slack, daily error digest, log only — check manually, unsure)
- Do you need circuit breakers for downstream services? (yes, no, unsure what that means)

#### Domain 4: Performance (4+ questions)

Uncover speed and scale expectations.

- What is the acceptable page load time? (< 1 second, < 3 seconds, < 5 seconds, doesn't matter much, unsure)
- How many concurrent users do you expect at peak? (< 100, 100-1K, 1K-10K, 10K-100K, 100K+, unsure)
- Do you need search? If so, what kind? (simple text filter, full-text search like Elasticsearch, semantic/AI search, faceted search with filters, no search, unsure)
- Do you need pagination strategy preference? (offset-based, cursor-based, infinite scroll, load more button, unsure)
- Are there any operations that must complete within a strict time budget (e.g., < 200ms API response)? (yes — specify which, no strict requirements, unsure)

#### Domain 5: Security (5+ questions)

Uncover security requirements beyond "add auth."

- What authentication methods do you need? (email + password only, OAuth/social login, SSO/SAML for enterprise, magic link/passwordless, multi-factor, unsure)
- What authorization model? (simple roles like admin/user, RBAC with custom roles, ABAC/attribute-based, per-resource permissions, unsure)
- Do you need data encryption at rest (beyond what the DB provides)? (yes — all sensitive fields, yes — specific fields only, DB-level encryption is enough, unsure)
- Are there compliance requirements? (GDPR, HIPAA, SOC2, PCI-DSS, CCPA, none that I know of, unsure)
- Do you need rate limiting? (yes — per user, yes — per endpoint, yes — per IP, no, unsure)
- Do you need content security policies (CSP, CORS, XSS protection beyond defaults)? (yes — strict, defaults are fine, unsure)
- Do you need data anonymization or pseudonymization for analytics? (yes, no, unsure)

#### Domain 6: User Experience (5+ questions)

Uncover UX decisions that affect architecture.

- Do you need internationalization (i18n) / multiple languages? (yes — from day 1, plan for it but English only at launch, no, unsure)
- Do you need accessibility compliance? (WCAG 2.1 AA, WCAG 2.1 AAA, basic accessibility, not a priority, unsure)
- What is the primary device? (desktop-first, mobile-first, tablet, equal across all, unsure)
- Do you need theming beyond dark/light mode (e.g., custom brand colors per tenant)? (yes — per-tenant theming, dark/light mode only, no theming, unsure)
- Do you need onboarding flows (guided tours, tooltips, empty states, checklists)? (yes — full onboarding experience, simple empty states with hints, no — users will figure it out, unsure)
- Do you need drag-and-drop interactions? (yes — core to the product, nice to have, no, unsure)
- Do you need keyboard shortcuts? (yes — power user feature, a few for common actions, no, unsure)

#### Domain 7: Testing Strategy (4+ questions)

Uncover quality expectations.

- What is your minimum acceptable test coverage? (> 90%, > 70%, > 50%, whatever the pipeline produces, unsure)
- Do you need visual regression testing (screenshot comparison)? (yes, no, unsure)
- Do you need load/stress testing? (yes — with specific targets, nice to have, no, unsure)
- Do you need contract testing between frontend and backend? (yes, no, unsure)
- Should the test suite include accessibility audits (e.g., axe-core)? (yes — blocking, yes — advisory, no, unsure)

#### Domain 8: Migration & Compatibility (4+ questions)

Uncover data and integration constraints.

- Is there existing data that needs to be migrated? (yes — from another product, yes — from spreadsheets/CSVs, yes — from a database, no — greenfield, unsure)
- Do you need to maintain backward compatibility with any existing API? (yes — specify, no — greenfield, unsure)
- Do you need import/export capabilities? (CSV import/export, JSON/API import, PDF export, no, unsure)
- Do you need a public API for third-party developers? (yes — from day 1, plan for it but not at launch, no, unsure)
- Are there browser support requirements beyond modern browsers? (must support IE11, must support Safari, modern browsers only, unsure)

#### Domain 9: Unknowns & Risks (4+ questions)

Surface what the user doesn't know they don't know.

- What is the biggest technical risk you see? (a specific integration, scale, real-time features, AI/ML components, none — it's straightforward, unsure)
- Is there a hard deadline or event driving the timeline? (yes — specify, soft target, no deadline, unsure)
- Are there any legal or regulatory unknowns? (yes — need legal review, possibly — haven't checked, no — well understood, unsure)
- What would cause this project to fail? (technical complexity, lack of users, budget/time, unclear requirements, competition, unsure)
- Is there anything you know you don't know that worries you? (free text via "Other / Let me explain")

### 3. Synthesize Interview Results

After all domains are complete, compile the results into a structured specification document:

```markdown
# Deep Interview Specification: [Product Name]

**Date:** YYYY-MM-DD
**Domains covered:** 9/9
**Questions answered:** [count]

## Product Concept
[1-2 paragraph summary of what the user wants to build, synthesized from all answers]

## Domain 1: Technical Implementation
### Decisions Made
- [decision]: [user's choice] — [implication]
### Open Questions
- [any "unsure" answers that need resolution]

## Domain 2: Architecture
### Decisions Made
- ...
### Open Questions
- ...

[... repeat for all 9 domains ...]

## Cross-Domain Insights
[Patterns and connections across domains. E.g., "User wants offline support + real-time collaboration — these interact in complex ways. Need conflict resolution strategy."]

## Risk Register
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [from Domain 9 + inferred risks] | H/M/L | H/M/L | [strategy] |

## Recommended Constraints for Spark
[Bullet list of constraints/decisions that should feed into spark's requirement gathering, so spark doesn't re-ask questions already answered here]
```

### 4. Save

Save to `.launchcraft/interview/YYYY-MM-DD-[product-name]-interview.md`.

### 5. Feed into Spark

After saving, automatically invoke spark with the interview context:

```
Skill(skill='spark')
```

Pass the interview spec path so spark knows to read it. Spark's Step -1 (Prompt Expansion) should incorporate the interview results to produce an even richer expanded spec. Spark should NOT re-ask questions that were already thoroughly covered in the interview.

## Output Validation

The interview skill does NOT dispatch contract-validator (it is a pre-pipeline skill). Validation happens when spark runs and produces its requirements document.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "40 questions is too many" | Users who invoke /interview WANT depth. They chose this path. Deliver it. |
| "I can infer the answer" | You cannot. Your inference is a guess. The user's answer is a decision. Ask. |
| "This domain doesn't apply" | Let the user say "skip domain." Don't decide for them. |
| "I'll batch 3 questions together" | One question at a time. Each answer may change the next question. |
| "AskUserQuestion is tedious for 40 questions" | It is required. Every. Single. Question. No exceptions. |
| "I'll summarize instead of saving" | Save the full document. Spark needs the raw decisions, not your summary. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Asked 40+ questions across all 9 domains (show count per domain)
- [ ] Used AskUserQuestion for every question (no plain-text questions)
- [ ] Adapted questions based on previous answers (show at least 2 skip/follow-up examples)
- [ ] Synthesized cross-domain insights (show section)
- [ ] Created risk register (show table)
- [ ] Saved interview document (show path)
- [ ] Invoked spark skill with interview context (show invocation)
