Set up the realtime collaboration infrastructure using Liveblocks.

## Progress

- [x] Read the Liveblocks setup spec, local Next.js route handler docs, and Liveblocks best-practice references.
- [x] Configure `liveblocks.config.ts` with typed presence and user metadata.
- [x] Add a cached Liveblocks Node client in `lib`.
- [x] Add deterministic cursor color mapping from Clerk user ID.
- [x] Create POST `/api/liveblocks-auth`.
- [x] Require Clerk authentication and verify project access.
- [x] Ensure the project Liveblocks room exists before authorizing.
- [x] Return a Liveblocks session token containing user name, avatar, and cursor color.
- [x] Run verification.

## Configuration

Configure the `liveblocks.config.ts` at the project root.

Define:

### Presence

- cursor position
- `isThinking` boolean

### UserMeta

- user ID
- display name
- avatar URL
- cursor color

## Liveblocks Client

Create a cached Liveblocks node client in lib. Add a helper that deterministically maps a user ID to a consistent color from a fixed palette.

## Auth Route

Create POST `/api/liveblocks-auth`.

Use the project ID as the Liveblocks room ID.

This route must:

1. require Clerk authentication
2. verify project access using the existing access helper
(create only if needed)

3. ensure the Liveblocks room exists
4. return a session token with:
- user name
- avatar
- generated cursor color

Return '403' for unauthorized project access.
