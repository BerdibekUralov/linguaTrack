"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getInitials } from "@/lib/utils";
import { Send, Loader2, Wifi, WifiOff } from "lucide-react";
import { supabase, chatChannel } from "@/lib/supabase";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
}

interface Partner {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  email: string;
}

interface Props {
  initialMessages: Message[];
  partner: Partner;
  currentUserId: string;
}

export function ConversationView({ initialMessages, partner, currentUserId }: Props) {
  const [messages, setMessages]     = useState<Message[]>(initialMessages);
  const [content, setContent]       = useState("");
  const [sending, setSending]       = useState(false);
  const [realtime, setRealtime]     = useState(false);
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const textareaRef                 = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Real-time via Supabase ─────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      // Supabase not configured — fall back to 3s polling
      const poll = async () => {
        try {
          const res = await fetch(`/api/messages/${partner.id}`);
          if (res.ok) {
            const data = await res.json() as { messages: Message[] };
            if (Array.isArray(data.messages)) setMessages(data.messages);
          }
        } catch { /* ignore */ }
      };
      const interval = setInterval(poll, 3000);
      return () => clearInterval(interval);
    }

    // Supabase configured — use Realtime Broadcast
    const sb = supabase;
    const channel = sb
      .channel(chatChannel(currentUserId, partner.id))
      .on("broadcast", { event: "new-message" }, ({ payload }) => {
        const msg = payload as Message;
        setMessages((prev) => {
          // Avoid duplicates (optimistic update already added it)
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      })
      .subscribe((status) => {
        setRealtime(status === "SUBSCRIBED");
      });

    return () => {
      void sb.removeChannel(channel);
    };
  }, [currentUserId, partner.id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (!text || sending) return;

    setSending(true);
    setContent("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: partner.id, content: text }),
      });

      if (res.ok) {
        const newMsg = await res.json() as Message;
        // Optimistic: add immediately (Supabase broadcast will deduplicate)
        setMessages((prev) =>
          prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
        );
        textareaRef.current?.focus();
      } else {
        setContent(text); // restore on error
      }
    } catch {
      setContent(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Real-time status indicator */}
      {supabase && (
        <div
          className="flex items-center gap-1.5 px-4 py-1.5 text-[11px]"
          style={{
            background: realtime ? "var(--success-bg)" : "var(--surface-2)",
            borderBottom: "1px solid var(--border)",
            color: realtime ? "var(--success)" : "var(--text-3)",
          }}
        >
          {realtime
            ? <><Wifi className="h-3 w-3" /> Live</>
            : <><WifiOff className="h-3 w-3" /> Connecting…</>
          }
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: "var(--text-3)" }}>
            No messages yet. Send the first message!
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
              {!isMine && (
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: "var(--primary)" }}
                >
                  {getInitials(msg.sender.name)}
                </div>
              )}
              <div
                className="max-w-xs rounded-2xl px-4 py-2 text-sm lg:max-w-md"
                style={{
                  background: isMine ? "var(--primary)" : "var(--surface-2)",
                  color: isMine ? "#fff" : "var(--text)",
                  borderBottomRightRadius: isMine ? 4 : undefined,
                  borderBottomLeftRadius:  !isMine ? 4 : undefined,
                }}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: isMine ? "rgba(255,255,255,0.7)" : "var(--text-3)" }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <form onSubmit={(e) => void sendMessage(e)} className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter — send, Shift+Enter — new line)"
            rows={1}
            className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none transition max-h-32"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fieldSizing: "content",
            } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--primary)" }}
          >
            {sending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </button>
        </form>
      </div>
    </div>
  );
}
