# DreamWeaverStudio Architecture

## Workspace Layout (Nx Library Pattern)

```
apps/
  server/                 # Fastify API Gateway (thin entry point)
  client/                 # React (Vite) SPA container (thin entry point)

libs/
  shared/
    types/                # Shared TypeScript interfaces, DTOs, schemas
    utils/                # Cross-cutting helpers and pure utilities

  server/
    data-access-db/       # MongoDB/Mongoose connection + repositories
    features/             # Core business logic, agents, Stripe, workflows

  client/
    data-access-api/      # API clients + TanStack Query hooks
    ui/                   # Dumb/presentational components
    features/             # Smart components, stores, page logic

docs/
  architecture.md         # This file
  repository.md           # Repo conventions
  versioning.md           # Release/versioning rules
```

## Boundary Rules

- Apps contain wiring/configuration only.
- All business logic lives in `libs`.
- `libs/shared/*` is the only cross-app surface area.
- `libs/server/*` is only imported by `apps/server`.
- `libs/client/*` is only imported by `apps/client`.
