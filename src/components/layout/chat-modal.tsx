"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  currentUserId: string;
}

export function ChatModal({ open, onClose, anchorRef, currentUserId }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data: Conversation[]) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [open]);

  const loadMessages = useCallback(async (partnerId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/${partnerId}`);
      if (res.ok) {
        const data = await res.json() as Message[];
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (activeId) void loadMessages(activeId); }, [activeId, loadMessages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    if (!open || !activeId) return;
    const interval = setInterval(() => void loadMessages(activeId), 4000);
    return () => clearInterval(interval);
  }, [open, activeId, loadMessages]);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && !anchorRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const sendMessage = async () => {
    if (!text.trim() || !activeId) return;
    setSending(true);
    const content = text.trim();
    setText("");
    try {
      await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receiverId: activeId, content }) });
      await loadMessages(activeId);
    } catch { /* ignore */ } finally { setSending(false); }
  };

  if (!open) return null;
  const activeConv = conversations.find((c) => c.partnerId === activeId);

  return (
    <div
      ref={panelRef}
      className="animate-slide-down absolute right-0 top-full mt-2 rounded-2xl overflow-hidden flex flex-col"
      style={{ width: 360, height: 480, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)", zIndex: 50 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          {activeId && (
            <button onClick={() => { setActiveId(null); setMessages([]); }} className="rounded-lg p-1 transition-opacity hover:opacity-70" style={{ color: "var(--text-2)" }}>
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
            {activeConv ? activeConv.partnerName : "Messages"}
          </span>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--text-3)" }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Conversation list */}
      {!activeId ? (
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "var(--text-3)" }}>
              <MessageSquare className="mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.partnerId}
                onClick={() => setActiveId(c.partnerId)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "var(--primary)" }}>
                  {c.partnerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{c.partnerName}</span>
                    <span className="text-[11px] ml-2 shrink-0" style={{ color: "var(--text-3)" }}>
                      {formatDistanceToNow(new Date(c.lastAt), { addSuffix: false })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{c.lastMessage}</p>
                    {c.unreadCount > 0 && (
                      <span className="ml-2 shrink-0 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--text-3)" }} />
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === currentUserId;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[75%] rounded-2xl px-3 py-2 text-sm"
                      style={{
                        background: mine ? "var(--primary)" : "var(--surface-2)",
                        color: mine ? "#fff" : "var(--text)",
                        borderBottomRightRadius: mine ? 4 : undefined,
                        borderBottomLeftRadius: !mine ? 4 : undefined,
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center gap-2 px-3 py-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
            <input
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
            />
            <button
              onClick={() => void sendMessage()}
              disabled={!text.trim() || sending}
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-opacity disabled:opacity-40"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
