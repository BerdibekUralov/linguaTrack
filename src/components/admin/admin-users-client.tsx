"use client";

import { useEffect, useState } from "react";
import {
  Users, UserPlus, Shield, GraduationCap, BookOpen,
  ToggleLeft, ToggleRight, X, Loader2, CheckCircle,
  AlertCircle, Pencil, Trash2, Eye, EyeOff,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  _count: { submissions: number };
}

type ModalMode = "create" | "edit";

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

interface FormState {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
}

const EMPTY_FORM: FormState = { name: "", email: "", password: "", role: "STUDENT" };

export function AdminUsersClient() {
  const [users, setUsers]             = useState<User[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<"ALL" | "ADMIN" | "TEACHER" | "STUDENT">("ALL");

  const [modalMode, setModalMode]     = useState<ModalMode>("create");
  const [editTarget, setEditTarget]   = useState<User | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm]               = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState("");

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers((await res.json()) as User[]);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { void loadUsers(); }, []);

  /* ── Open modals ─────────────────────────────────────────────── */
  const openCreate = () => {
    setModalMode("create");
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setModalMode("edit");
    setEditTarget(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setFormError("");
    setShowPassword(false);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  /* ── Create ──────────────────────────────────────────────────── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setFormError(data.error ?? "Failed"); return; }
      showToast(`User "${form.name}" created`, "success");
      closeModal();
      await loadUsers();
    } catch { setFormError("Network error"); }
    finally { setSubmitting(false); }
  };

  /* ── Edit ────────────────────────────────────────────────────── */
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSubmitting(true);
    setFormError("");
    try {
      const body: Partial<FormState> = { name: form.name, email: form.email, role: form.role };
      if (form.password) body.password = form.password;

      const res = await fetch(`/api/admin/users/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setFormError(data.error ?? "Failed"); return; }
      showToast(`User "${form.name}" updated`, "success");
      closeModal();
      await loadUsers();
    } catch { setFormError("Network error"); }
    finally { setSubmitting(false); }
  };

  /* ── Toggle active ───────────────────────────────────────────── */
  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { showToast(data.error ?? "Failed", "error"); return; }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: !isActive } : u));
      showToast(!isActive ? "User activated" : "User deactivated", "success");
    } catch { showToast("Network error", "error"); }
  };

  /* ── Delete ──────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json() as { error?: string };
      if (!res.ok) { showToast(data.error ?? "Failed to delete", "error"); return; }
      showToast(`User "${deleteTarget.name}" deleted`, "success");
      setDeleteTarget(null);
      await loadUsers();
    } catch { showToast("Network error", "error"); }
    finally { setDeleting(false); }
  };

  /* ── Filtered list ───────────────────────────────────────────── */
  const filtered = filter === "ALL" ? users : users.filter((u) => u.role === filter);
  const counts = {
    ALL:     users.length,
    ADMIN:   users.filter((u) => u.role === "ADMIN").length,
    TEACHER: users.filter((u) => u.role === "TEACHER").length,
    STUDENT: users.filter((u) => u.role === "STUDENT").length,
  };

  const inp = "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors";
  const inpStyle = { background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" };

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
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "ADMIN", "TEACHER", "STUDENT"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: filter === r ? "var(--primary)" : "var(--surface)",
              color:      filter === r ? "#fff" : "var(--text-2)",
              border:     `1px solid ${filter === r ? "var(--primary)" : "var(--border)"}`,
            }}
          >
            <Users className="h-3.5 w-3.5" />
            {r === "ALL" ? "All" : ROLE_META[r].label}
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                background: filter === r ? "rgba(255,255,255,0.2)" : "var(--surface-2)",
                color:      filter === r ? "#fff" : "var(--text-3)",
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
                className="flex items-center gap-4 px-5 py-4 animate-fade-slide-up"
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : undefined,
                  animationDelay: `${i * 0.03}s`,
                  opacity: user.isActive ? 1 : 0.55,
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

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => openEdit(user)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:opacity-70"
                    style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
                    title="Edit user"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(user)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:opacity-70"
                    style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
                    title="Delete user"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => void toggleActive(user.id, user.isActive)}
                    className="transition-opacity hover:opacity-70"
                    title={user.isActive ? "Deactivate" : "Activate"}
                  >
                    {user.isActive
                      ? <ToggleRight className="h-6 w-6" style={{ color: "var(--success)" }} />
                      : <ToggleLeft  className="h-6 w-6" style={{ color: "var(--text-3)" }} />
                    }
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit modal — NO backdrop click to close */}
      {showModal && (
        <div className="modal-backdrop">
          <div
            className="animate-slide-down w-full max-w-[480px] mx-4 rounded-2xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--primary-bg)" }}>
                  {modalMode === "create"
                    ? <UserPlus className="h-4 w-4" style={{ color: "var(--primary)" }} />
                    : <Pencil   className="h-4 w-4" style={{ color: "var(--primary)" }} />
                  }
                </div>
                <h2 className="font-semibold" style={{ color: "var(--text)" }}>
                  {modalMode === "create" ? "Add New User" : `Edit — ${editTarget?.name}`}
                </h2>
              </div>
              <button onClick={closeModal} style={{ color: "var(--text-3)" }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => void (modalMode === "create" ? handleCreate(e) : handleEdit(e))}
              className="px-6 py-5 space-y-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className={inp}
                  style={inpStyle}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Email Address</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="user@example.com"
                  className={inp}
                  style={inpStyle}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                  Password
                  {modalMode === "edit" && (
                    <span className="ml-1.5 font-normal" style={{ color: "var(--text-3)" }}>(leave blank to keep current)</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={modalMode === "create"}
                    minLength={modalMode === "create" ? 6 : undefined}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder={modalMode === "create" ? "At least 6 characters" : "New password (optional)"}
                    className={`${inp} pr-10`}
                    style={inpStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: "var(--text-3)" }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as FormState["role"] }))}
                  className={inp}
                  style={inpStyle}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {formError && (
                <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
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
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : modalMode === "create" ? <UserPlus className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  {submitting ? (modalMode === "create" ? "Creating..." : "Saving...") : (modalMode === "create" ? "Create User" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal — also NO backdrop click to close */}
      {deleteTarget && (
        <div className="modal-backdrop">
          <div
            className="animate-slide-down w-full max-w-[400px] mx-4 rounded-2xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
          >
            <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--danger-bg)" }}>
                  <Trash2 className="h-5 w-5" style={{ color: "var(--danger)" }} />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: "var(--text)" }}>Delete User</h2>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>This action cannot be undone</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm" style={{ color: "var(--text-2)" }}>
                Are you sure you want to delete <strong style={{ color: "var(--text)" }}>{deleteTarget.name}</strong>?
                All their data (submissions, enrollments) will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
                  style={{ background: "var(--danger)", color: "#fff" }}
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
