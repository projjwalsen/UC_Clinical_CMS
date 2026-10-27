export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type AssistantChat = {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: string;
  messages: AssistantMessage[];
};

export type AssistantReportEntry = {
  id: string;
  title: string;
  format: "PDF" | "Excel";
  pinned: boolean;
  createdAt: string;
};

export type AssistantWorkspace = {
  activeChatId: string | null;
  chats: AssistantChat[];
  reports: AssistantReportEntry[];
};
