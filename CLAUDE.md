# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # Install deps, generate Prisma client, run migrations (first-time setup)
npm run dev          # Start dev server with Turbopack
npm run dev:daemon   # Start dev server in background, logs to logs.txt
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run all Vitest tests
npm run db:reset     # Reset database (destructive)
```

To run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

Requires Node.js 18+. All `npm run` scripts prepend `NODE_OPTIONS='--require ./node-compat.cjs'` to strip Node 25+ Web Storage globals that break SSR.

## Environment

Copy `.env` and add `ANTHROPIC_API_KEY=sk-...` to enable Claude AI. Without it, the app falls back to a `MockLanguageModel` in `src/lib/provider.ts` that returns static demo components.

## Architecture

UIGen is an AI-powered React component generator. Users describe components in natural language; Claude generates working JSX files stored in a virtual (in-memory) filesystem, then renders them live in a sandboxed iframe.

### Data Flow

1. User sends a message in the chat panel
2. `ChatProvider` (`src/lib/contexts/chat-context.tsx`) calls `POST /api/chat` via Vercel AI SDK
3. The route handler (`src/app/api/chat/route.ts`) streams tool calls from Claude using the system prompt in `src/lib/prompts/generation.tsx`
4. Claude calls `str_replace_editor` (create/edit files) or `file_manager` (rename/delete) tool implementations in `src/lib/tools/`
5. Tool results update the `VirtualFileSystem` via `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`)
6. `PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) re-renders the iframe, which runs `src/lib/transform/jsx-transformer.ts` to Babel-transform JSX and build an import map pointing to esm.sh CDN

### Key Modules

- **`src/lib/file-system.ts`** — `VirtualFileSystem` class: in-memory FS, serializable to JSON for DB persistence. All component files live here; nothing writes to disk.
- **`src/lib/transform/jsx-transformer.ts`** — Babel-transforms JSX in the browser, resolves imports to esm.sh URLs, injects Tailwind CDN. Entry point is always `/App.jsx`.
- **`src/lib/provider.ts`** — Wraps `@ai-sdk/anthropic`; falls back to `MockLanguageModel` when no API key is set.
- **`src/lib/prompts/generation.tsx`** — System prompt given to Claude. Defines tool contracts and constraints (Tailwind-only styling, `/App.jsx` as entry point, no external images).
- **`src/lib/auth.ts`** — JWT session management (7-day expiry, bcrypt passwords). Middleware in `src/middleware.ts` protects `/api/projects` and `/api/filesystem`.

### UI Layout

`src/app/main-content.tsx` renders a resizable 3-panel layout:
- **Left (35%):** Chat interface (`src/components/chat/`)
- **Right (65%):** Tabs toggle between:
  - **Preview:** iframe via `PreviewFrame`
  - **Code:** file tree (30%) + Monaco editor (70%) via `src/components/editor/`

### Persistence

Authenticated users get project persistence via Prisma/SQLite (`prisma/schema.prisma`). Projects store `messages` (JSON stringified chat history) and `data` (JSON stringified `VirtualFileSystem`). Anonymous users' work is tracked in `src/lib/anon-work-tracker.ts`.

### Path Aliases

`@/*` maps to `src/*` (configured in `tsconfig.json`).

## Tech Stack Notes

- **Tailwind CSS v4** — uses CSS-based config (`src/app/globals.css`) rather than `tailwind.config.js`. Generated components must use Tailwind utility classes only (no custom CSS or inline styles).
- **Next.js 15 App Router** — all routes under `src/app/`. The `[projectId]` dynamic segment loads a specific saved project.
- **React 19** — server and client components coexist; client components are marked with `"use client"`.
