"use client";

import { useMemo, useState } from "react";
import {
  FileSpreadsheet,
  MessageSquare,
  MessageSquarePlus,
  PanelLeft,
  Pin,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { sortChats, sortReports } from "@/lib/clinical-assistant-utils";
import { useDemoStore } from "@/lib/demo-store";
import { Button, Input } from "@/components/ui/core";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "Summarize this patient's latest visit and labs.",
  "Which patients have PDAI ≥ 7?",
  "Export relapse data for 2024 to Excel.",
];

type SidebarTab = "chats" | "reports";

function HistoryRow({
  label,
  sublabel,
  active,
  pinned,
  onSelect,
  onPin,
  onDelete,
}: {
  label: string;
  sublabel?: string;
  active?: boolean;
  pinned: boolean;
  onSelect: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-lg transition-colors",
        active ? "bg-white shadow-sm ring-1 ring-slate-200" : "hover:bg-white/70",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full flex-col gap-0.5 py-2.5 pl-3 pr-16 text-left"
      >
        <span className="flex items-center gap-1.5">
          {pinned && (
            <Pin className="size-3 shrink-0 fill-teal-600 text-teal-600" />
          )}
          <span className="truncate text-[13px] font-medium text-slate-800">
            {label}
          </span>
        </span>
        {sublabel ? (
          <span className="truncate pl-0 text-[11px] text-slate-400">
            {sublabel}
          </span>
        ) : null}
      </button>
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-0.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          aria-label={pinned ? "Unpin" : "Pin"}
          onClick={(e) => {
            e.stopPropagation();
            onPin();
          }}
          className={cn(
            "rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700",
            pinned && "text-teal-600 opacity-100",
          )}
        >
          <Pin className={cn("size-3.5", pinned && "fill-current")} />
        </button>
        <button
          type="button"
          aria-label="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function SidebarPanel({
  onCloseMobile,
  showClose,
}: {
  onCloseMobile?: () => void;
  showClose?: boolean;
}) {
  const {
    assistant,
    newAssistantChat,
    selectAssistantChat,
    deleteAssistantChat,
    togglePinAssistantChat,
    deleteAssistantReport,
    togglePinAssistantReport,
  } = useDemoStore();
  const [tab, setTab] = useState<SidebarTab>("chats");

  const chats = useMemo(() => sortChats(assistant.chats), [assistant.chats]);
  const reports = useMemo(
    () => sortReports(assistant.reports),
    [assistant.reports],
  );

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col bg-slate-50/90">
      <div className="flex items-center gap-2 border-b border-slate-200/80 px-3 py-3">
        {showClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-slate-500 hover:bg-white md:hidden"
          >
            <X className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            newAssistantChat();
            setTab("chats");
            onCloseMobile?.();
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-teal-800"
        >
          <MessageSquarePlus className="size-4 text-teal-700" />
          New chat
        </button>
      </div>

      <div className="px-3 pt-3">
        <div className="flex rounded-lg bg-slate-200/60 p-0.5">
          <button
            type="button"
            onClick={() => setTab("chats")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition",
              tab === "chats"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <MessageSquare className="size-3.5" />
            Chats
            {chats.length > 0 && (
              <span className="text-slate-400">{chats.length}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("reports")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition",
              tab === "reports"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <FileSpreadsheet className="size-3.5" />
            Reports
            {reports.length > 0 && (
              <span className="text-slate-400">{reports.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {tab === "chats" ? (
          chats.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs leading-relaxed text-slate-400">
              No conversations yet. Start a new chat or use a prompt in the
              main panel.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {chats.map((chat) => (
                <li key={chat.id}>
                  <HistoryRow
                    label={chat.title}
                    active={assistant.activeChatId === chat.id}
                    pinned={chat.pinned}
                    onSelect={() => {
                      selectAssistantChat(chat.id);
                      onCloseMobile?.();
                    }}
                    onPin={() => togglePinAssistantChat(chat.id)}
                    onDelete={() => deleteAssistantChat(chat.id)}
                  />
                </li>
              ))}
            </ul>
          )
        ) : reports.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs leading-relaxed text-slate-400">
            Generated PDF or Excel exports will appear here. In the demo, mention
            &ldquo;export&rdquo; or &ldquo;PDF&rdquo; in a message.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {reports.map((report) => (
              <li key={report.id}>
                <HistoryRow
                  label={report.title}
                  sublabel={report.format}
                  pinned={report.pinned}
                  onSelect={onCloseMobile ?? (() => {})}
                  onPin={() => togglePinAssistantReport(report.id)}
                  onDelete={() => deleteAssistantReport(report.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function AssistantSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      <div className="hidden h-full border-r border-slate-200 md:block">
        <SidebarPanel />
      </div>
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] md:hidden"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 z-50 shadow-xl md:hidden">
            <SidebarPanel onCloseMobile={onCloseMobile} showClose />
          </div>
        </>
      )}
    </>
  );
}

export function ClinicalAssistantPage() {
  const { assistant, newAssistantChat, sendAssistantMessage } = useDemoStore();
  const [draft, setDraft] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeChat = assistant.chats.find(
    (c) => c.id === assistant.activeChatId,
  );

  const submit = () => {
    if (!draft.trim()) return;
    sendAssistantMessage(draft);
    setDraft("");
  };

  return (
    <div className="-mx-4 -mb-6 flex min-h-[calc(100vh-4.5rem)] flex-col md:-mx-6 md:min-h-[calc(100vh-5rem)]">
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-none border-y border-slate-200 bg-white md:rounded-xl md:border md:shadow-sm">
        <AssistantSidebar
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 md:hidden"
              aria-label="Open history"
              onClick={() => setSidebarOpen(true)}
            >
              <PanelLeft className="size-5" />
            </button>
            <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
              {activeChat?.title ?? "Clinical Assistant"}
            </h1>
            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              Preview
            </span>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="mx-auto flex max-w-lg flex-col items-center pt-10 text-center md:pt-20">
                <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                  <Sparkles className="size-5" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">
                  How can I help with your registry data?
                </h2>
                <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                  Questions, summaries, and export requests—connected to a local
                  model in a future release.
                </p>
                <div className="mt-8 grid w-full gap-2 sm:grid-cols-1">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendAssistantMessage(prompt)}
                      className="rounded-lg border border-slate-200 px-4 py-3 text-left text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-5">
                {activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-teal-700 text-white"
                          : "bg-slate-100 text-slate-800",
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/50 p-4">
            <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm focus-within:border-teal-300 focus-within:ring-2 focus-within:ring-teal-500/10">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Ask anything about patients, visits, or reports…"
                className="h-10 flex-1 border-0 bg-transparent shadow-none focus:ring-0"
              />
              <Button
                type="button"
                size="sm"
                className="h-9 shrink-0 rounded-xl px-3"
                onClick={submit}
                disabled={!draft.trim()}
              >
                <Send className="size-4" />
              </Button>
            </div>
            {!activeChat && (
              <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-slate-400">
                <button
                  type="button"
                  className="text-slate-600 hover:text-teal-700 hover:underline"
                  onClick={newAssistantChat}
                >
                  New chat
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
