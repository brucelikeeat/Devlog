# Source Layout

This folder follows a feature-aware single-app structure.

## Folder rules

- `app/`
  - Route segments, layouts, and Next.js route handlers only.
- `components/`
  - Reusable UI pieces shared across multiple features.
- `features/`
  - Product domains. Put feature-specific UI, hooks, and orchestration here before promoting truly reusable pieces to `components/`.
- `lib/`
  - Shared helpers and infrastructure clients such as AI SDK wrappers, GitHub helpers, auth utilities, DB clients, and generic utilities.
- `server/`
  - Server-only business logic, repositories, jobs, and schemas. Avoid putting complex business logic directly in route handlers.
- `styles/`
  - Global styling and theme-level files.
- `types/`
  - Shared app-level types that are not better owned by a specific feature.

## Recommended ownership model

- If only one domain uses it, keep it inside `features/<domain>`.
- If multiple domains use it, move it to `components/`, `lib/`, `server/`, or `types/` depending on what it is.
