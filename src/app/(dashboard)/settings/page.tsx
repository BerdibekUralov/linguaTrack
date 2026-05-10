"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User, Lock, Sun, Moon, Monitor, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile]     = useState({ name: "", bio: "", phone: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState("");
  const [error, setError]         = useState("");
  const { theme, setTheme }       = useTheme();

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d: { name?: string; bio?: string; phone?: string }) =>
        setProfile({ name: d.name ?? "", bio: d.bio ?? "", phone: d.phone ?? "" })
      );
  }, []);

  const showMsg = (msg: string, isError = false) => {
    if (isError) { setError(msg); setMessage(""); }
    else { setMessage(msg); setError(""); }
    setTimeout(() => { setMessage(""); setError(""); }, 3500);
  };

  const saveProfile = async () => {
    setLoading(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setLoading(false);
    res.ok ? showMsg("Profile updated successfully") : showMsg("Something went wrong", true);
  };

  const changePassword = async () => {
    setLoading(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwords),
    });
    setLoading(false);
    if (res.ok) {
      showMsg("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "" });
    } else {
      const json = await res.json() as { error?: string };
      showMsg(json.error ?? "Something went wrong", true);
    }
  };

  const themes = [
    { id: "light",  label: "Light",  icon: Sun },
    { id: "dark",   label: "Dark",   icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Settings</h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>Profile and security settings</p>
      </div>

      {message && (
        <div
          className="flex items-center gap-2 rounded-xl p-4 text-sm animate-slide-down"
          style={{ background: "var(--success-bg)", color: "var(--success)" }}
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl p-4 text-sm animate-slide-down" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {/* Theme */}
      <SettingCard icon={Sun} iconBg="var(--primary-bg)" iconColor="var(--primary)" title="Appearance" subtitle="Choose your interface theme">
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className="flex flex-col items-center gap-2 rounded-xl py-4 transition-all"
              style={{
                background: theme === id ? "var(--primary-bg)" : "var(--surface-2)",
                border: theme === id ? "2px solid var(--primary)" : "2px solid transparent",
                color: theme === id ? "var(--primary)" : "var(--text-2)",
              }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </SettingCard>

      {/* Profile */}
      <SettingCard icon={User} iconBg="var(--primary-bg)" iconColor="var(--primary)" title="Profile information" subtitle="Edit your personal details">
        <div className="space-y-4">
          <Input label="Full name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="John Smith" />
          <Input label="Phone number" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 555 123 4567" />
          <Textarea label="Bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} placeholder="Tell us about yourself..." />
          <Button onClick={saveProfile} loading={loading}>Save changes</Button>
        </div>
      </SettingCard>

      {/* Password */}
      <SettingCard icon={Lock} iconBg="var(--danger-bg)" iconColor="var(--danger)" title="Change password" subtitle="Update your password regularly for security">
        <div className="space-y-4">
          <Input type="password" label="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} placeholder="••••••••" />
          <Input type="password" label="New password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="At least 8 characters" />
          <Button onClick={changePassword} loading={loading} variant="outline">Change password</Button>
        </div>
      </SettingCard>
    </div>
  );
}

function SettingCard({
  icon: Icon, iconBg, iconColor, title, subtitle, children,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: iconBg }}>
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{title}</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}
