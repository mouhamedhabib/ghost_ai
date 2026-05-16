Build the '/editor/[roomId]f workspace shell with server-side access checks. No canvas logic yet.

## Progress

- [x] Read spec and relevant Next.js app router docs for async `params` and `redirect`.
- [x] Confirm server-side access checks redirect unauthenticated users and render `AccessDenied` for missing or unauthorized projects.
- [x] Reuse the existing `ProjectSidebar` in the workspace with the current room highlighted.
- [x] Render the full-viewport workspace shell with navbar, canvas placeholder, and AI sidebar placeholder.
- [x] Run the build/type checks and resolve errors.

## Access

/editor/ [roomId]

Before rendering:

- unauthenticated users redirect to '/sign-in
- users without project access see 'AccessDenied'
- non-existent projects also show 'AccessDenied'

Create components/editor/access-denied.tsx' with:

- centered layout
- lock icon
- short message
- link back to /editor'

must be a server component.

## Access Helpers

Create 'lib/project-access.ts' with helpers for:

- getting current Clerk identity: 'userId' + primary email
- checking project access by owner or collaborator

## Layout

Build a full-viewport workspace layout with:

- top navbar showing the project name
- navbar actions: share button and AI sidebar toggle
- existing 'ProjectSidebar' on the left
- current room highlighted in the sidebar
- central canvas placeholder with dark background and centered message
- right sidebar placeholder for future AI chat

The canvas area should fill the remaining space.

I## Scope

Do not add real canvas logic, Liveblocks, AI chat, or sharing behavior yet.

## Check When Done

-'/editor/[roomId]' builds successfully
- access helper exists outside the page component
- 'AccessDenied' is used for missing or unauthorized projects
- workspace layout renders with current project context
- no TypeScript errors
