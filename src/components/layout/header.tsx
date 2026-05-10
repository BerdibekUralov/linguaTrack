"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, MessageSquare, Search, GraduationCap, Menu, ChevronDown } from "lucide-react";
import { NotificationPanel } from "./notification-panel";
import { ChatModal } from "./chat-modal";
import { SearchModal } from "./search-modal";
import { ProfileDropdown } from "./profile-dropdown";

interface Props {
  currentUserId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  onMenuToggle?: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  TEACHER: "Teacher",
  STUDENT: "Student",
  ADMIN: "Admin",
};

export function Header({ currentUserId, userName, userEmail, userRole, onMenuToggle }: Props) {
  const [unreadNotifs, setUnreadNotifs]     = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifOpen, setNotifOpen]           = useState(false);
  const [chatOpen, setChatOpen]             = useState(false);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [profileOpen, setProfileOpen]       = useState(false);

  const notifRef   = useRef<HTMLButtonElement>(null);
  const chatRef    = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLButtonElement>(null);

  const fetchCounts = useCallback(async () => {
    try {
      const [notifRes, msgRes] = await Promise.all([
        fetch("/api/notifications/unread-count"),
        fetch("/api/messages"),
      ]);
      if (notifRes.ok) {
        const d = await notifRes.json() as { count: number };
        setUnreadNotifs(d.count ?? 0);
      }
      if (msgRes.ok) {
        const convs = await msgRes.json() as { unreadCount: number }[];
        if (Array.isArray(convs)) {
          setUnreadMessages(convs.reduce((s, c) => s + c.unreadCount, 0));
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    void fetchCounts();
    const id = setInterval(() => void fetchCounts(), 15_000);
    return () => clearInterval(id);
  }, [fetchCounts]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const openNotif   = () => { setChatOpen(false); setProfileOpen(false); setNotifOpen((v) => !v); };
  const openChat    = () => { setNotifOpen(false); setProfileOpen(false); setChatOpen((v) => !v); };
  const openProfile = () => { setNotifOpen(false); setChatOpen(false); setProfileOpen((v) => !v); };

  const initials = userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <header
        className="flex h-[60px] shrink-0 items-center justify-between px-4 sm:px-6 gap-4"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-3 shrink-0">
          {onMenuToggle && (
            <button onClick={onMenuToggle} className="lg:hidden rounded-xl p-2 transition-colors" style={{ color: "var(--text-2)" }}>
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "var(--primary)" }}>
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--text)" }}>LinguaTrack</span>
          </div>
        </div>

        {/* Center — Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex flex-1 max-w-xs items-center gap-2.5 rounded-xl px-4 py-2 text-sm transition-all"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-3)" }}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd>Ctrl K</kbd>
        </button>

        {/* Right */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setSearchOpen(true)} className="sm:hidden relative rounded-xl p-2 transition-colors" style={{ color: "var(--text-2)" }}>
            <Search className="h-5 w-5" />
          </button>

          {/* Chat */}
          <div className="relative">
            <button
              ref={chatRef} onClick={openChat}
              className="relative rounded-xl p-2.5 transition-colors"
              style={{ color: chatOpen ? "var(--primary)" : "var(--text-2)", background: chatOpen ? "var(--primary-bg)" : "transparent" }}
              title="Messages"
            >
              <MessageSquare className="h-5 w-5" />
              {unreadMessages > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: "var(--primary)" }}>
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </button>
            <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} anchorRef={chatRef} currentUserId={currentUserId} />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              ref={notifRef} onClick={openNotif}
              className="relative rounded-xl p-2.5 transition-colors"
              style={{ color: notifOpen ? "var(--primary)" : "var(--text-2)", background: notifOpen ? "var(--primary-bg)" : "transparent" }}
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifs > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: "#ef4444" }}>
                  {unreadNotifs > 9 ? "9+" : unreadNotifs}
                </span>
              )}
            </button>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} anchorRef={notifRef} />
          </div>

          <div className="mx-1 h-6 w-px" style={{ background: "var(--border)" }} />

          {/* Profile */}
          <div className="relative">
            <button
              ref={profileRef} onClick={openProfile}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors"
              style={{ background: profileOpen ? "var(--primary-bg)" : "transparent" }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "var(--primary)" }}>
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold leading-tight" style={{ color: "var(--text)" }}>{userName}</p>
                <p className="text-[10px] leading-tight" style={{ color: "var(--text-3)" }}>{ROLE_LABEL[userRole] ?? userRole}</p>
              </div>
              <ChevronDown
                className="hidden md:block h-3.5 w-3.5 transition-transform"
                style={{ color: "var(--text-3)", transform: profileOpen ? "rotate(180deg)" : undefined }}
              />
            </button>
            <ProfileDropdown open={profileOpen} onClose={() => setProfileOpen(false)} anchorRef={profileRef} name={userName} email={userEmail} role={userRole} />
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
