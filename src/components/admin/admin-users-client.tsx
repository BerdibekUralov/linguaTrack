"use client";

import { useEffect, useState, useRef } from "react";
import { Users, UserPlus, Shield, GraduationCap, BookOpen, ToggleLeft, ToggleRight, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  _count: { submissions: number };
}

const ROLE_META = {
  ADMIN:   { label: "Admin",   icon: Shield,        bg: "#ede9fe", color: "#7c3aed" },
  TEACHER: { label: "Teacher", icon: GraduationCap, bg: "#dbeafe", color: "#2563eb" },
  STUDENT: { label: "Student", icon: BookOpen,       bg: "#dcfce7", color: "#16a34a" },
};

function Toast({ msg, type, onDone }: { msg: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-xl text-sm font-medium animate-slide-down"
      style={{
        background: type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
        border: `1px solid ${type === "success" ? "var(--success)" : "var(--danger)"}`,
        color: type === "success" ? "var(--success)" : "var(--danger)",
      }}
    >
      {type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {msg}
    </div>
  );
}

export function AdminUsersClient() {
  const [users, setUsers]         = useState<User[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [filter, setFilter]       = useState<"ALL" | "ADMIN" | "TEACHER" | "STUDENT">("ALL");

  const nameRef     = useRef<HTMLInputElement>(null);
  const emailRef    = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const roleRef     = useRef<HTMLSelectElement>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers((await res.json()) as User[]);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { void loadUsers(); }, []);

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name     = nameRef.current?.value.trim() ?? "";
    const email    = emailRef.current?.value.trim() ?? "";
    const password = passwordRef.current?.value ?? "";
    const role     = roleRef.current?.value ?? "STUDENT";

    if (!name || !email || !password) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { showToast(data.error ?? "Failed to create user", "error"); return; }

      showToast(`User "${name}" created successfully`, "success");
      setShowForm(false);
      await loadUsers();
    } catch { showToast("Network error", "error"); }
    finally { setSubmitting(false); }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !isActive }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { showToast(data.error ?? "Failed", "error"); return; }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: !isActive } : u));
      showToast(!isActive ? "User activated" : "User deactivated", "success");
    } catch { showToast("Network error", "error"); }
  };

  const filtered = filter === "ALL" ? users : users.filter((u) => u.role === filter);

  const counts = {
    ALL: users.length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    TEACHER: users.filter((u) => u.role === "TEACHER").length,
    STUDENT: users.filter((u) => u.role === "STUDENT").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>User Management</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
            Create and manage platform accounts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "ADMIN", "TEACHER", "STUDENT"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: filter === r ? "var(--primary)" : "var(--surface)",
              color: filter === r ? "#fff" : "var(--text-2)",
              border: `1px solid ${filter === r ? "var(--primary)" : "var(--border)"}`,
            }}
          >
            <Users className="h-3.5 w-3.5" />
            {r === "ALL" ? "All" : ROLE_META[r].label}
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                background: filter === r ? "rgba(255,255,255,0.2)" : "var(--surface-2)",
                color: filter === r ? "#fff" : "var(--text-3)",
              }}
            >
              {counts[r]}
            </span>
          </button>
        ))}
      </div>

      {/* User list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--text-3)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--surface-2)" }}>
              <Users className="h-7 w-7 opacity-20" style={{ color: "var(--text-3)" }} />
            </div>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>No users found</p>
          </div>
        ) : (
          filtered.map((user, i) => {
            const meta = ROLE_META[user.role];
            const Icon = meta.icon;
            return (
              <div
                key={user.id}
                className="flex items-center gap-4 px-5 py-4 transition-colors animate-fade-slide-up"
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : undefined,
                  animationDelay: `${i * 0.03}s`,
                  opacity: user.isActive ? 1 : 0.5,
                }}
              >
                {/* Avatar */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: user.isActive ? "var(--primary)" : "var(--text-3)" }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{user.name}</span>
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {meta.label}
                    </span>
                    {!user.isActive && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{user.email}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>
                    Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {user.role === "STUDENT" && ` · ${user._count.submissions} submissions`}
                  </p>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => void toggleActive(user.id, user.isActive)}
                  className="shrink-0 transition-opacity hover:opacity-70"
                  title={user.isActive ? "Deactivate user" : "Activate user"}
                >
                  {user.isActive
                    ? <ToggleRight className="h-6 w-6" style={{ color: "var(--success)" }} />
                    : <ToggleLeft  className="h-6 w-6" style={{ color: "var(--text-3)" }} />
                  }
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Create user modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div
            className="animate-slide-down w-full max-w-[480px] mx-4 rounded-2xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--primary-bg)" }}>
                  <UserPlus className="h-4 w-4" style={{ color: "var(--primary)" }} />
                </div>
                <h2 className="font-semibold" style={{ color: "var(--text)" }}>Add New User</h2>
              </div>
              <button onClick={() => setShowForm(false)} style={{ color: "var(--text-3)" }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => void handleCreate(e)} className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Full Name</label>
                <input
                  ref={nameRef}
                  required
                  placeholder="e.g. John Smith"
                  className="rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Email Address</label>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  placeholder="user@example.com"
                  className="rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Password</label>
                <input
                  ref={passwordRef}
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Role</label>
                <select
                  ref={roleRef}
                  defaultValue="STUDENT"
                  className="rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-opacity disabled:opacity-60"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
