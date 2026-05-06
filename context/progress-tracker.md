# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Authentication integration complete

## Current Goal

- Prepare for the next feature chapter.

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

## In Progress

- None currently.

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
