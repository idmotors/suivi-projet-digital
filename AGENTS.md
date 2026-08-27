# Jalons — Agent Guide

## Project overview

Jalons is a French-language project portfolio tracker. Users can create, edit, filter, and delete projects, then manage dated milestones inside each project. All records persist in Netlify Database.

## Architecture

- `src/routes/index.tsx`: main React dashboard and CRUD user interface.
- `src/routes/api/`: TanStack Start server routes exposing the projects and milestones REST API.
- `src/lib/project-data.ts`: shared client-side types, choices, and empty form values.
- `src/lib/server-projects.ts`: server-only validation and database query helpers.
- `db/schema.ts`: Drizzle schema for projects and milestones.
- `db/index.ts`: Netlify Database Drizzle client.
- `netlify/database/migrations/`: deploy-time database migrations and starter records.
- `src/styles.css`: global visual system, responsive layout, and component states.

## Data flow

The dashboard calls `/api/projects` and related dynamic endpoints. TanStack Start runs these handlers server-side, where Drizzle uses the native `drizzle-orm/netlify-db` adapter. Deleting a project cascades to its milestones.

## Conventions

- Keep UI text in French.
- Use PascalCase for React components and camelCase for functions and variables.
- Keep database column names in snake_case and TypeScript property names in camelCase.
- Validate and normalize all API input in `src/lib/server-projects.ts`.
- Use the existing CSS variables and semantic class names rather than adding an unrelated component library.
- Keep the interface responsive and preserve loading, empty, error, hover, and focus states.

## Database changes

Update `db/schema.ts`, then run `pnpm exec drizzle-kit generate --name <imperative_snake_case_name>`. Migration output must remain under `netlify/database/migrations/` so Netlify applies it during deployment.

## Local development

Use `pnpm dev` for the frontend or `netlify dev --port 8889` when local Netlify platform emulation is required. Production builds use `pnpm build` through `netlify.toml`.
