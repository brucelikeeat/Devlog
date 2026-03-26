# ADR-0001: Initial Project Structure

## Status

Accepted

## Context

Devlog needs a structure that is:

- fast to start with,
- friendly to solo development,
- easy for multiple agent chats to work in parallel,
- and able to evolve into a larger architecture later.

## Decision

Use a single-app Next.js structure with internal domain boundaries:

- `src/app` for routes and route handlers
- `src/components` for reusable UI
- `src/features` for domain modu  les
- `src/lib` for shared helpers and infrastructure clients
- `src/server` for business logic and server-only code
- `docs/agent-worklog.md` as the required coordination layer for feature branches

## Consequences

### Positive

- Low setup overhead
- Fast MVP iteration
- Clear boundaries for feature-based work
- Easy migration path to a monorepo later

### Negative

- Backend and frontend will still live in one application at first
- Strong discipline is required to avoid pushing all logic into route files

## Follow-up

Revisit this decision after `v0.2.0` if:

- webhook/AI workloads become complex,
- multiple services are needed,
- or multiple contributors are working concurrently for an extended period.
