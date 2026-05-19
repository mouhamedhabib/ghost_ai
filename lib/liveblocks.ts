import { Liveblocks } from "@liveblocks/node"

const CURSOR_COLORS = [
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#eab308",
] as const

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined
}

export function getCursorColorForUser(userId: string) {
  let hash = 0

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0
  }

  return CURSOR_COLORS[hash % CURSOR_COLORS.length]
}

export function hasLiveblocksSecret() {
  return Boolean(process.env.LIVEBLOCKS_SECRET_KEY)
}

export function getLiveblocksClient() {
  if (globalForLiveblocks.liveblocks) {
    return globalForLiveblocks.liveblocks
  }

  const secret = process.env.LIVEBLOCKS_SECRET_KEY

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is required")
  }

  const client = new Liveblocks({ secret })

  globalForLiveblocks.liveblocks = client

  return client
}
