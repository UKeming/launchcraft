# LaunchCraft Design Doc

## Overview

Claude Code plugin that provides a full product development pipeline — from need discovery to launch — through independent skills, MCP servers, agents, and a self-optimizing memory system.

## Architecture

LaunchCraft is a **Claude Code plugin** composed of:

- **Skills** — independent, individually invocable pipeline stages
- **MCP Servers** — external capability providers (web scraping, Cloudflare API, etc.)
- **Agents** — sub-agents for complex multi-step tasks
- **Memory** — development-time tuning memory that feeds back into prompt optimization

## Skills (7 stages)

| Skill | Purpose |
|-------|---------|
| `need-discovery` | Manual input or scrape (competitors/Product Hunt/Reddit + user feedback/issues/forums) |
| `user-story` | Generate user stories from discovered needs |
| `design-doc` | Generate design documents |
| `tdd-testing` | Write tests and acceptance criteria before implementation |
| `impl` | Implement code |
| `test-report` | Generate test reports |
| `launch` | Deploy to Cloudflare, auto-assign `appX.keming.co` subdomain |

Each skill is independent and can be invoked standalone. Pipeline orchestration comes later.

## MCP Servers

Provide external capabilities to skills:

- **Web scraping** — for need-discovery (Product Hunt, Reddit, GitHub issues, forums)
- **Cloudflare API** — for launch (DNS, Workers/Pages deployment)
- Others TBD as skills are developed

## Agents

Sub-agents handle complex multi-step tasks within skills. Specific agent designs will emerge during skill development.

## Memory System

- Captures tuning insights during plugin development (prompt adjustments, flow improvements, failure patterns)
- Shared memory: cross-project knowledge (committed to repo)
- Individual memory: project-specific context (gitignored)
- Feeds back into skill prompts automatically

## Deployment

- Target: Cloudflare (Workers / Pages)
- Domain: `keming.co`
- App subdomain pattern: `appX.keming.co`

## Development Plan

1. Develop individual skills, MCP servers, and agents
2. Iterate with memory-driven optimization
3. Wire pipeline orchestration once components are stable
4. Open source when ready

## Users

- Phase 1: Personal use
- Phase 2: Open source for Claude Code community
