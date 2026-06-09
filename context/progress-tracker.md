# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- All core features complete: auth integration, editor shell, project management UI, database setup, and project APIs wired to frontend.

## Current Goal

- Ready for next feature chapter.

## Completed

- Design system setup from `context/feature_specs/01_desgin_system.md` is in place with shadcn/ui primitives, lucide-react, Tailwind class merging utilities, and dark theme alignment.
- Built the editor shell from `context/feature_specs/02editor.md`.
- Added `components/editor/editor-navbar.tsx` with fixed-height left/center/right sections, sidebar toggle button, state-based `PanelLeftOpen` / `PanelLeftClose` icons, dark background, and subtle bottom border.
- Added `components/editor/project-sidebar.tsx` with floating overlay positioning, slide-in left transition, `isOpen` prop, Projects header, close button, shadcn Tabs for My Projects and Shared, empty placeholder states, and full-width New Project action.
- Added `components/editor/editor-dialog.tsx` as a reusable editor dialog styling pattern using existing token classes, with title, description, and footer action support.
- Added `components/editor/editor-shell.tsx` and rendered it from `app/page.tsx` so the navbar/sidebar interaction is implemented.
- Moved `EditorShell` into `app/layout.tsx` so the editor navbar and project sidebar frame route content from the layout.
- Verified `npx tsc --noEmit` and `npm run lint` pass.
- Installed `@clerk/ui` and added Clerk's dark theme with app CSS-variable overrides in `lib/clerk-appearance.ts`.
- Wrapped the root layout with `ClerkProvider`, using existing Clerk env vars and `/sign-in`, `/sign-up`, and `/editor` redirect configuration.
- Added root `proxy.ts` with protected-first Clerk route protection; only `/sign-in(.*)` and `/sign-up(.*)` remain public.
- Moved editor chrome into `app/(app)/layout.tsx`, added `/editor`, and redirected `/` to `/editor`.
- Added minimal two-panel desktop auth pages and mobile form-only auth pages at `/sign-in/[[...sign-in]]` and `/sign-up/[[...sign-up]]`.
- Added Clerk's built-in `UserButton` to the editor navbar right section while keeping default Clerk profile/menu flows.
- Verified `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.
- Updated auth pages to a screenshot-aligned 50/50 split layout with a colored left brand panel, feature rows with lucide icons, and centered Clerk forms on the right.
- Normalized app font variables so the UI guideline tokens `--font-sans` and `--font-mono` resolve to the configured Geist fonts.
- Refined the auth screenshot match with dedicated `--brand-accent`, `--auth-panel`, and `--auth-icon` tokens, a rounded Ghost AI brand mark, stronger left-side color contrast, and wider feature spacing.
- Fixed Clerk logout navigation by setting sign-out redirects to the public `/sign-in` route, avoiding post-logout navigation to protected `/`.
- Built the `/editor` home screen from `context/feature_specs/04_project_dialog.md` with centered project creation copy and a `Plus` icon New Project action.
- Added mock project data, owned/shared sidebar project rows, owned-only rename/delete actions, and mobile backdrop scrim outside-tap close behavior.
- Added a dedicated project dialog hook/provider for create, rename, and delete dialog state, form state, loading state, and live slug previews without API calls or persistence.
- Wired editor home create, sidebar create, sidebar rename, and sidebar delete actions to the dialog flow.
- Verified `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.

- Implemented Prisma setup from `context/feature_specs/05_prisma.md` with Project and ProjectCollaborator models, Prisma client singleton with adapter for PostgreSQL, and successful migration and build.
- Implemented project API routes from `context/feature_specs/06project_apis.md`:
  - `GET /api/projects` lists current user's projects
  - `POST /api/projects` creates a project with default name "Untitled Project"
  - `PATCH /api/projects/[projectId]` renames project (owner-only)
  - `DELETE /api/projects/[projectId]` deletes project (owner-only)
  - All routes enforce authentication (401 for unauthenticated, 403 for non-owners)
  - Uses Clerk auth() and Prisma with PostgreSQL adapter
- Installed missing `@prisma/client@^7.8.0` dependency
- Verified `npm run build` passes with all API routes compiled

- Implemented wire-up from `context/feature_specs/07wire_editor_home.md`:
  - Created `lib/projects.ts` with server-side `getProjectsForUser()` that fetches owned and shared projects using Clerk auth and Prisma
  - Converted `editor-home.tsx` to a server component that fetches real project data server-side
  - Created `editor-home-client.tsx` client wrapper that calls `setInitialProjects()` to populate sidebar/dialogs on mount
  - Updated `useProjectDialogs` hook to call real API endpoints:
    - `POST /api/projects` creates project and navigates to workspace on success
    - `PATCH /api/projects/[id]` renames project and updates state on success
    - `DELETE /api/projects/[id]` deletes project and redirects if deleting active workspace
  - Sidebar now displays real owned and shared projects from database
  - Create dialog generates room ID preview from project name
  - Rename dialog pre-fills current project name
  - Delete dialog shows project name being deleted
  - Verified `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass

- Implemented starter template library from `context/feature_specs/18-starter-template.md`:
  - Created `components/editor/starter-templates.ts` with:
    - `CanvasTemplate` type for template structure
    - `CANVAS_TEMPLATES` array with three pre-built templates: Microservices, CI/CD Pipeline, and Event-Driven System
    - Helper functions `createNode()`, `createEdge()`, and `calculateTemplateBounds()` for readable template definitions
    - Template nodes use shared canvas types and existing node color palette
  - Created `components/editor/starter-templates-modal.tsx` with:
    - `TemplatePreview` component that renders SVG previews of templates (280x200px fixed size)
    - Preview rendering includes edge lines and all shape types (rectangle, circle, diamond, pill, hexagon, cylinder)
    - Modal dialog with scrollable grid of template cards
    - Each card displays template name, description, and import button
    - `StarterTemplatesModal` component with open/close state and onImport callback
  - Updated `components/editor/workspace-navbar.tsx`:
    - Added `onOpenTemplates` optional callback prop
    - Added Zap icon button to open templates modal
  - Updated `components/editor/workspace-page.tsx`:
    - Added state for templates modal open/close
    - Created ref and callback for template import function
    - Wired StarterTemplatesModal into page layout
    - Connected EditorCanvas onCanvasReady callback
  - Updated `components/editor/canvas.tsx`:
    - Created `CanvasTemplate` type import and `EditorCanvasProps` with `onCanvasReady` callback
    - Added `handleImportTemplate()` in FlowCanvas that:
      - Removes all existing nodes and edges
      - Adds template nodes and edges to canvas
      - Fits viewport to show imported template
    - Created `onCanvasReady` effect to expose import function to parent component
    - Added context setup (not actively used but available for future expansion)
  - Integration flow: Template selection → Modal → WorkspacePage callback → EditorCanvas → FlowCanvas import handler
  - Template import replaces current canvas content (clears before adding)
  - Uses existing Liveblocks collaborative state management (`onNodesChange`, `onEdgesChange`)
  - Verified `npm run build` passes without errors

- Implemented presence avatars and live cursors from `context/feature_specs/19-presence-avatars-cursor.md`:
  - Added a canvas-only top-right participant group in `components/editor/canvas.tsx`
  - Uses Clerk `useUser()` to resolve the current user and filters matching Liveblocks users out of collaborator avatars
  - Renders collaborators as display-only avatars with image, initials fallback, five-avatar limit, overflow chip, and dark-canvas rings
  - Renders the current user separately through Clerk `UserButton`, with divider only when collaborators are present
  - Replaced the default React Flow cursor helper with custom Liveblocks cursor broadcasting on React Flow `onMouseMove` and clearing on `onMouseLeave`
  - Added custom live cursor pointers and name badges colored from Liveblocks user metadata
  - Updated `liveblocks.config.ts` presence typing to `cursor` and `thinking`
  - Verified `npm run build` passes

- Implemented AI sidebar shell from `context/feature_specs/20-ai-sidebar-shell.md`:
  - Added sidebar-specific color token aliases in `app/globals.css` for base surfaces, elevated/subtle surfaces, text roles, borders, brand tint, and accent text.
  - Created `components/editor/ai-sidebar.tsx` with parent-controlled open/close state while preserving the existing right-side floating slide transition and shadow treatment.
  - Added the AI Workspace header with bot icon, subtitle, and close button.
  - Added shadcn Tabs for AI Architect and Specs with muted inactive styling and accent active styling.
  - Built the AI Architect tab with scrollable chat area, empty state, starter prompt chips, right/left message bubbles, auto-sizing textarea, and Enter-to-send behavior.
  - Built the Specs tab with Generate Spec button and a static elevated demo spec card with disabled download action.
  - Verified `npm run build` passes.

- Implemented design agent API backend wiring from `context/feature_specs/22-design-agent-api.md`:
  - Added `TaskRun` Prisma model, indexes, project relation, and migration for Trigger.dev run ownership tracking.
  - Added `POST /api/ai/design` to validate prompt, room ID, and project ID, verify project access, trigger the `design-agent` task, persist the run, and return the run ID.
  - Added `POST /api/ai/design/token` to verify run ownership and return a run-scoped Trigger.dev public token.
  - Added `trigger/design-agent.ts` with a minimal callable task that logs and echoes `prompt` and `roomId`.
  - Updated Prisma client import to use the generated package entrypoint and removed the Prisma 7-deprecated datasource URL from `schema.prisma`.
  - Verified `npm run build` passes.

- Implemented full design agent logic from `context/feature_specs/23-design-agent-logic.md`:
  - Updated `trigger/design-agent.ts` to interpret prompts with Gemini through `@ai-sdk/google`.
  - Applies AI-generated add, move, resize, data update, delete node, add edge, and delete edge actions through Liveblocks React Flow `mutateFlow()`.
  - Enforces allowed canvas node shapes, the existing node color palette, minimum dimensions, and readable spacing bounds before mutating the room.
  - Publishes shared Liveblocks AI status events for start, processing, completion, and failures.
  - Sets Ghost AI server-side Liveblocks presence with cursor and thinking state while the task runs, then clears it on finish.
  - Wired the AI Architect form to trigger `POST /api/ai/design`.
  - Added a canvas AI status feed and thinking indicators on AI presence/cursor UI.
  - Updated Trigger.dev imports to the v4 `@trigger.dev/sdk` entrypoint.
  - Verified `npx tsc --noEmit` and `npm run build` pass.

## In Progress

- Implemented AI presence state and shared AI activity indicators from `context/feature_specs/24-ai-presence-state.md`.
- Implemented real-time room chat feed in the AI sidebar from `context/feature_specs/25-sidebar-chat-feed.md`.
- Implemented backend flow for AI-powered spec generation from `context/feature_specs/27-spec-generation-flow.md` with Trigger.dev task and token routes.
- Implemented spec persistence and download routes from `context/feature_specs/28-spec-persistence-download.md` using Vercel Blob and Prisma.
- Implemented spec generation UI integration from `context/feature_specs/29-spec-ui-integration.md` allowing users to view, preview, and download specs from the AI sidebar.

## In Progress

## Next Up

- Continue with the next feature spec.

## Open Questions

- None currently.

## Architecture Decisions

- Use generated shadcn/ui components as the primitive layer and do not hand-edit files in `components/ui/*` after generation.
- Keep editor chrome state in a small Client Component boundary so App Router pages can remain server-rendered by default.

## Session Notes

- Read `AGENTS.md`; this project uses Next.js `16.2.4` and App Router. Relevant local Next docs were checked in `node_modules/next/dist/docs/01-app/index.md`.
- For the editor chrome work, checked the local Next.js App Router server/client component guide in `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`.
- For the auth work, checked the local Next.js 16 Proxy docs in `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` and `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.
- For the project dialog work, checked the local Next.js App Router layouts/pages and server/client component docs in `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` and `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`.
