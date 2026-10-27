import type {
  AssistantChat,
  AssistantReportEntry,
  AssistantWorkspace,
} from "@/types/clinical-assistant";

export function chatTitleFromMessage(text: string) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return "New chat";
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}…` : trimmed;
}

export function sortChats(chats: AssistantChat[]) {
  return [...chats].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function sortReports(reports: AssistantReportEntry[]) {
  return [...reports].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function createEmptyWorkspace(): AssistantWorkspace {
  return { activeChatId: null, chats: [], reports: [] };
}

export const ASSISTANT_PREVIEW_REPLY =
  "Preview mode: no model is connected. When integrated, answers would be generated from your registry data (visits, labs, PDAI, surgery, etc.) with citations.";

export function seedAssistantWorkspace(now = new Date().toISOString()): AssistantWorkspace {
  const chatId = `chat-seed-1`;
  return {
    activeChatId: chatId,
    chats: [
      {
        id: chatId,
        title: "Patients with PDAI ≥ 7",
        pinned: true,
        updatedAt: now,
        messages: [
          {
            id: "m1",
            role: "user",
            content: "List all patients with PDAI ≥ 7 in the last year.",
            createdAt: now,
          },
          {
            id: "m2",
            role: "assistant",
            content: ASSISTANT_PREVIEW_REPLY,
            createdAt: now,
          },
        ],
      },
    ],
    reports: [
      {
        id: "rpt-seed-1",
        title: "Relapse cohort — 2024",
        format: "Excel",
        pinned: false,
        createdAt: now,
      },
    ],
  };
}
