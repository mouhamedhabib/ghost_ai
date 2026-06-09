declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: Record<string, never>;

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent:
      | {
          type: "ai-status";
          id: string;
          kind: "started" | "processing" | "complete" | "error";
          message: string;
          createdAt: string;
        }
      | {
          type: "ai-chat";
          id: string;
          sender: string;
          role: "user" | "assistant";
          content: string;
          createdAt: string;
        };
    FeedMessageData: {
      text?: string;
    };
    ThreadMetadata: Record<string, never>;
    RoomInfo: Record<string, never>;
    GroupInfo: Record<string, never>;
    ActivitiesData: Record<string, never>;
  }
}

export {};
