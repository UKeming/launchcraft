---
name: enhance
description: "Use after differentiation to expand requirements with additional features, differentiation angles, and user story opportunities. Triggers on: enhancing requirements, adding features, deepening product scope, expanding functionality."
---

# Requirement Enhancer

## Philosophy

**A user types one sentence. We deliver a production-grade commercial application.**

This skill is the engine that transforms a simple idea into a comprehensive, monetizable, enterprise-ready product. The user said "build me X" — our job is to imagine every feature that X needs to compete with established players, retain users, and make money.

Think like a product lead at a Series B startup: you've raised $20M, you have 30 engineers, and you need to ship a product that wins market share. What does that product look like? THAT is the level of feature richness we aim for.

**Do NOT be conservative.** Do NOT trim scope. The entire point of this plugin is that a simple sentence becomes a complex commercial app. If the output isn't dramatically richer than the input, this skill failed.

<HARD-GATE>
Before proposing enhancements:
1. Read ALL upstream docs (requirements, research, differentiation)
2. Research competitors' FULL feature sets via web search — not highlights, EVERYTHING
3. Walk through EVERY commercial dimension below and identify what's missing
4. Propose a comprehensive enhancement set that transforms the product
5. Get user approval (default: approve all)

Do NOT just add random features. Every enhancement must tie to user pain points, competitive gaps, commercial viability, or strategic bets. But the bar for inclusion is LOW — if a real commercial product would have it, add it.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Requirements doc exists at `docs/requirements/*.md`
- [ ] Research report exists at `docs/research/*.md`
- [ ] Differentiation strategy exists at `docs/strategy/*-differentiation.md`

If validation fails, stop and run the missing upstream skill first.

## Process

### 1. Analyze Current State

Read all upstream docs. Build a gap analysis:

```markdown
## Current State Analysis

**Must-Have features:** [count] — [list]
**Should-Have features:** [count] — [list]
**Nice-to-Have features:** [count] — [list]
**Strategic bets:** [list from differentiation]
**Competitive gaps identified:** [list from research]
**Commercial readiness:** [% of dimensions below covered]
```

### 2. Research Competitor Feature Sets

Use web search to deeply analyze what competitors offer — go DEEP:

- Full feature lists of top 3-5 competitors (not just marketing pages — check docs, changelogs, pricing pages)
- Pricing tiers and what's gated behind each tier
- Features users request in reviews/forums/Reddit/Twitter that competitors lack
- Emerging trends in the space (what new products are doing differently)
- Adjacent product categories that overlap with ours

For each competitor, catalog:
```markdown
### [Competitor Name]

**Pricing:** [free/freemium/paid tiers and prices]
**Total feature count:** [N]
**Features we don't have:**
- [feature]: [why users want it]

**Features users complain about:**
- [complaint]: [opportunity for us]

**Gated/premium features:**
- [feature]: [what tier, what price]
```

### 3. Commercial Dimension Audit

**This is the core of enhance.** The dimensions below are a **menu, not a mandatory checklist**. Before diving in:

1. Read the product's requirements and differentiation strategy
2. Decide which dimensions are **relevant** for THIS specific product (mark as Core / Relevant / Skip)
3. Only propose features from Core and Relevant dimensions — skip ones that don't fit

For example:
- A B2B SaaS → Core: User Management, Billing, Admin, Analytics, API. Skip: Gamification, Social.
- A consumer social app → Core: Collaboration, Growth, Notifications, Personalization. Skip: API, Admin (lighter).
- A developer tool → Core: API, Search, Power User, Integration. Skip: Social, Gamification, Media.

For each dimension you include, ask: "Does our requirements doc cover this? If not, what features should we add?"

**Dimensions reference** (pick what fits):

#### a. User Management & Identity
- Registration (email, social OAuth, SSO, magic links)
- Login / logout / session management
- User profiles (avatar, bio, settings, preferences)
- Roles & permissions (admin, member, viewer, custom roles)
- Teams / organizations / workspaces
- Invitation system (invite by email, shareable links)
- Account deletion & data export (GDPR)

#### b. Monetization & Billing
- Pricing tiers (free, pro, enterprise)
- Payment processing (Stripe, etc.)
- Subscription management (upgrade, downgrade, cancel)
- Trial periods (free trial, time-limited features)
- Usage-based billing (if applicable)
- Invoices & receipts
- Refund handling
- Revenue analytics

#### c. Admin Panel & Operations
- Admin dashboard (user stats, revenue, system health)
- User management (search, ban, impersonate, edit)
- Content moderation (flag, review, approve/reject)
- Feature flags (enable/disable features per tier or user)
- System settings (global config, maintenance mode)
- Announcement / changelog system

#### d. Analytics & Insights
- Usage analytics (what features are used, how often)
- User analytics (DAU/MAU, retention, cohorts)
- Business metrics dashboard (MRR, churn, LTV, conversion)
- Export / reporting capabilities
- User-facing analytics (their own data, trends, insights)

#### e. Communication & Notifications
- In-app notifications (real-time bell icon)
- Email notifications (transactional + marketing)
- Push notifications (if mobile/PWA)
- Email digest preferences (daily, weekly, instant)
- Notification settings (granular on/off per type)
- System announcements / banners

#### f. Search & Discovery
- Full-text search across all content
- Filters & faceted search
- Sort options (date, relevance, popularity)
- Saved searches / filters
- Recent / suggested items
- Tags / categories / labels

#### g. Collaboration & Social
- Sharing (links, embeds, social sharing)
- Comments / discussions on items
- @mentions and notifications
- Activity feed / timeline
- Real-time collaboration (if applicable)
- Public profiles / portfolios

#### h. Integration & API
- REST or GraphQL API for developers
- Webhooks for external integrations
- Third-party integrations (Slack, Zapier, etc.)
- Import from competitors / CSV / common formats
- Export data (CSV, JSON, PDF)
- Embeddable widgets

#### i. Content & Media
- File upload (images, documents, videos)
- Image processing (resize, crop, thumbnails)
- CDN delivery for media
- Rich text editor for content creation
- Version history for content

#### j. Personalization & Customization
- Theme selection (light/dark/custom)
- Layout preferences
- Dashboard customization (widgets, order)
- Custom fields / metadata
- Saved views / presets
- Language / locale preferences (i18n)

#### k. Security & Compliance
- Two-factor authentication (TOTP, SMS, passkeys)
- Audit log (who did what, when)
- Rate limiting & abuse prevention
- Data encryption (at rest, in transit)
- Privacy controls (visibility settings)
- Terms of service / privacy policy integration
- Cookie consent management
- GDPR data export / deletion

#### l. Growth & Engagement
- Onboarding flow (guided tour, checklists, templates)
- Referral system (invite friends, earn rewards)
- Gamification (streaks, badges, achievements, leaderboards)
- Email drip campaigns (welcome series, re-engagement)
- Empty states with CTAs (guide new users to value)
- Social proof (testimonials, usage counters, "X people are using this")

#### m. Power User Features
- Keyboard shortcuts (with discoverable hints)
- Bulk operations (select all, bulk edit, bulk delete)
- Advanced filters & saved queries
- CLI tool or API for automation
- Custom automations / workflows / rules
- Templates & presets for common tasks

#### n. Reliability & Performance
- Caching strategy (CDN, server-side, client-side)
- Rate limiting (API, UI)
- Error handling & recovery (graceful degradation)
- Offline support / PWA capabilities
- Loading states & skeleton screens
- Retry logic for failed operations

#### o. Support & Help
- Help center / documentation (in-app)
- In-app chat support or chatbot
- FAQ section
- Feedback / feature request submission
- Bug report flow
- Status page (uptime monitoring)

### 4. Propose Enhancements

After the dimension audit, present a COMPREHENSIVE proposal. Group by dimension, not by priority.

First, show which dimensions you selected and why:

```markdown
## Dimension Relevance

| Dimension | Relevance | Rationale |
|-----------|-----------|-----------|
| User Management | Core | Multi-user SaaS, needs auth + roles |
| Monetization | Core | Subscription product |
| Gamification | Skip | B2B tool, gamification doesn't fit |
| ... | ... | ... |

## Enhancement Proposal

**Dimensions selected:** [N] Core + [N] Relevant out of 15
**Features before enhance:** [N total]
**Features proposed to add:** [N total]
**Features after enhance (projected):** [N total]

### [Dimension Name] — [N features to add]
| # | Feature | Priority | Source | Rationale | Effort |
|---|---------|----------|--------|-----------|--------|
| 1 | [feature] | Must/Should/Nice | [competitive parity / user demand / commercial necessity / strategic bet] | [why] | S/M/L |

[repeat for each dimension that has gaps]
```

**Aim for 30-80+ additional features across selected dimensions.** If you're proposing fewer than 15, you're probably not thinking big enough — but the right number depends on the product. A B2B SaaS may need 60+, a focused developer tool may need 25. Use judgment, but err on the side of MORE.

Ask the user: "Here's the full enhancement proposal. I recommend adding all of them — this is what makes the product commercially viable. Want to approve all, or select specific ones?"

### 5. Update Requirements Document

After user approval, update the original requirements document at `docs/requirements/*.md`:
- Add approved features to the appropriate tier (Must/Should/Nice-to-Have)
- Add new sections for dimensions not previously covered (Monetization, Admin, Analytics, etc.)
- Update the competitive landscape if new competitors were found
- Add any new non-functional requirements discovered
- Update the technical architecture indicators section

**IMPORTANT:** Edit the existing requirements file — do NOT create a separate copy. The requirements doc is the single source of truth.

### 6. Save Enhancement Record

Save the enhancement record to `docs/enhanced/YYYY-MM-DD-[product-name]-enhanced.md`:

```markdown
# Enhancement Record: [Product Name]

**Date:** YYYY-MM-DD
**Requirements Doc:** docs/requirements/[filename].md
**Research Report:** docs/research/[filename].md
**Differentiation Strategy:** docs/strategy/[filename].md
**Status:** Approved

## Commercial Dimension Coverage

| Dimension | Before | After | Features Added |
|-----------|--------|-------|---------------|
| User Management & Identity | [%] | [%] | [N] |
| Monetization & Billing | [%] | [%] | [N] |
| Admin Panel & Operations | [%] | [%] | [N] |
| Analytics & Insights | [%] | [%] | [N] |
| Communication & Notifications | [%] | [%] | [N] |
| Search & Discovery | [%] | [%] | [N] |
| Collaboration & Social | [%] | [%] | [N] |
| Integration & API | [%] | [%] | [N] |
| Content & Media | [%] | [%] | [N] |
| Personalization & Customization | [%] | [%] | [N] |
| Security & Compliance | [%] | [%] | [N] |
| Growth & Engagement | [%] | [%] | [N] |
| Power User Features | [%] | [%] | [N] |
| Reliability & Performance | [%] | [%] | [N] |
| Support & Help | [%] | [%] | [N] |
| **TOTAL** | **[%]** | **[%]** | **[N]** |

## Enhancements Added

### Features Added
| # | Feature | Dimension | Tier | Source | Rationale |
|---|---------|-----------|------|--------|-----------|

### Differentiation Angles Added
| # | Angle | Rationale |
|---|-------|-----------|

### User Story Opportunities Identified
| # | Story Area | Persona | Journey Stage |
|---|-----------|---------|---------------|

## Competitor Deep-Dive
[Detailed competitor feature analysis from Step 2]

## Enhancement Metrics
- **Features before:** [N must + N should + N nice]
- **Features after:** [N must + N should + N nice]
- **Net additions:** [N]
- **Commercial dimension coverage:** [before]% → [after]%
- **New differentiation angles:** [N]
- **New user story opportunities:** [N]
```

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: enhance
Output path: [the enhancement record file]
```

Do NOT proceed until the validator returns PASS.
Once the validator returns PASS, **immediately invoke `/differentiation`** — the differentiation strategy must be re-run on the updated requirements. Do NOT ask the user whether to continue.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "The current requirements are enough" | Enough for a weekend project, not a commercial product. Add more. |
| "Adding features will delay launch" | This plugin builds the ENTIRE thing. More features = more value, not more delay. |
| "Users don't need all these features" | Users expect commercial-grade products. Missing features = "why is this so basic?" |
| "We'll add features in v2" | There is no v2 in our pipeline. v1 IS the product. Make it complete. |
| "This is scope creep" | This is scope COMPLETION. A commercial product needs auth, billing, admin, analytics, etc. |
| "The differentiation strategy is fine as-is" | More features = more differentiation surface. Re-analyze after enhance. |
| "Monetization features aren't needed for MVP" | If it can't make money, it's a demo, not a product. |
| "Admin panel is overkill" | If there are users, there's user management. If it's SaaS, admin is table stakes. |
| "This dimension doesn't apply" | Maybe — but justify the skip. Don't skip because it's work, skip because it truly doesn't fit. |
| "Users won't use half of these" | The half they DO use is different for every user. Completeness = retention. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Analyzed current requirements state (show feature counts)
- [ ] Researched 3+ competitors' full feature sets via web search (show analysis)
- [ ] Evaluated all 15 dimensions for relevance, selected Core/Relevant ones (show dimension table)
- [ ] Proposed features across selected dimensions — quantity appropriate for product type (show proposal)
- [ ] Received user approval (show approval)
- [ ] Updated the requirements document with approved features (show diff)
- [ ] Saved enhancement record with dimension coverage metrics (show path)
- [ ] Dispatched contract-validator and received PASS (show result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "Add AI to everything" | "Add AI auto-tagging because 47 Reddit threads request it for competitor X" |
| "Copy all competitor features" | "Add features where we're below table stakes + amplify our strategic bets" |
| "Just add more CRUD operations" | "Add keyboard shortcuts, bulk operations, search, admin panel, billing — a real product" |
| "Generic features list" | "Each feature tied to evidence: competitive gap, user request, or commercial necessity" |
| "10 features added, done" | "52 features added across 12 dimensions, commercial coverage: 34% → 87%" |
| "Billing can come later" | "Stripe integration with 3 tiers, trial periods, and usage tracking — day one" |
| "No one needs an admin panel" | "Admin panel with user management, analytics dashboard, content moderation, and feature flags" |
