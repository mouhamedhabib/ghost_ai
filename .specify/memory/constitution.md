<!--
Sync Impact Report
- Version change: init → 1.0.0
- Modified principles: added Collaboration-first architecture; Server-driven access and data integrity; Next.js best practices first; Testable quality by default; Maintainability through strong typing and modularity
- Added sections: Technology & Security Constraints; Development Workflow
- Removed sections: none
- Templates reviewed: .specify/templates/plan-template.md ✅ reviewed; .specify/templates/spec-template.md ✅ reviewed; .specify/templates/tasks-template.md ✅ reviewed
- Follow-up TODOs: none
-->
# GhostAI Constitution

## Core Principles

### I. Collaboration-first architecture
GhostAI MUST model realtime collaboration explicitly and preserve shared state invariants. Live canvas state, user presence, and project metadata MUST be separated so the system remains predictable, resilient, and easy to reason about.

### II. Server-driven access and data integrity
All access control and persistence decisions MUST happen on the server. Client code is only permitted to render data after server authorization, and every API route MUST validate Clerk auth, project ownership, and request input before any business logic executes.

### III. Next.js best practices first
Use App Router server components by default and add `use client` only when browser-only interactivity requires it. Keep route handlers focused, use composable hooks for reusable logic, and avoid monolithic layouts or page modules.

### IV. Testable quality by default
New behavior MUST be supported by tests before it is considered complete. Unit tests for utilities and UI logic, integration tests for route handlers and workspace flows, and regression coverage for auth gates and collaboration paths MUST accompany feature work.

### V. Maintainability through strong typing and modularity
Code MUST use explicit TypeScript types, narrow inputs, and small reusable modules. Feature code should be organized into clear folders, with documentation updates made whenever conventions or architectural decisions change.

## Technology & Security Constraints
GhostAI adopts the existing stack: Next.js App Router, TypeScript, Clerk auth, Prisma-backed persistence, and Liveblocks for realtime collaboration. Secrets and database credentials MUST remain on the server. No client-side code may import server-only modules such as Prisma or secret-aware utilities.

## Development Workflow
Changes MUST be proposed through `.specify/` artifacts and linked back to this constitution. Pull requests MUST reference one or more core principles and include compliance evidence such as tests, auth rationale, and implementation scope. Reviews MUST confirm that the App Router conventions are preserved and that `use client` is only used when needed.

## Governance
This constitution is the source of truth for GhostAI engineering decisions. Amendments require a documented change to this file, review by maintainers, and updates to any affected `.specify` workflow or guidance documents.

Version policy:
- MAJOR when a principle is removed or redefined in a way that changes the project’s engineering direction
- MINOR when a new principle or explicit workflow requirement is added
- PATCH for clarifications, wording updates, or non-substantive governance refinements

Every pull request MUST include a compliance note. The project MUST use `.specify/templates/plan-template.md` Constitution Check and update that workflow when this constitution changes.

**Version**: 1.0.0 | **Ratified**: 2026-05-17 | **Last Amended**: 2026-05-17
