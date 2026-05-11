"use client";

import { useState } from "react";
import { Video, VideoOff, Maximize2, X, AlertCircle } from "lucide-react";

interface VideoCallProps {
  roomUrl: string;
  title?: string;
  onLeave?: () => void;
}

export function VideoCall({ roomUrl, title, onLeave }: VideoCallProps) {
  const [joined,  setJoined]  = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  if (!roomUrl) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-2xl py-16"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        <AlertCircle className="h-8 w-8 opacity-30" style={{ color: "var(--text-3)" }} />
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Video call link not available yet
        </p>
      </div>
    );
  }

  if (!joined) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-2xl py-16 px-6 text-center"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "var(--primary-bg)" }}
        >
          <Video className="h-8 w-8" style={{ color: "var(--primary)" }} />
        </div>
        {title && (
          <p className="font-semibold" style={{ color: "var(--text)" }}>{title}</p>
        )}
        <p className="text-sm max-w-xs" style={{ color: "var(--text-3)" }}>
          Camera and microphone will be requested when you join.
        </p>
        <button
          onClick={() => setJoined(true)}
          className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "var(--primary)" }}
        >
          <Video className="h-4 w-4" />
          Join call
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden ${
        fullscreen ? "fixed inset-0 z-50" : ""
      }`}
      style={{ background: "#000", border: "1px solid var(--border)" }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2" style={{ background: "rgba(0,0,0,.7)" }}>
        <p className="text-sm font-medium text-white truncate">{title ?? "Video Call"}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="rounded-lg p-1.5 text-white/70 hover:text-white transition"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setJoined(false); onLeave?.(); }}
            className="rounded-lg p-1.5 text-white/70 hover:text-red-400 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Daily.co iframe */}
      <iframe
        src={roomUrl}
        allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
        className="w-full"
        style={{ height: fullscreen ? "calc(100vh - 44px)" : "560px", border: "none" }}
        title="Video call"
      />
    </div>
  );
}

/** Compact "Join" button — shows full VideoCall inline when clicked */
export function VideoJoinButton({
  roomUrl,
  label = "Join video call",
}: {
  roomUrl: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  if (open) {
    return <VideoCall roomUrl={roomUrl} onLeave={() => setOpen(false)} />;
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      style={{ background: "var(--primary)" }}
    >
      <Video className="h-4 w-4" />
      {label}
    </button>
  );
}

/** Shows offline icon if no room configured yet */
export function VideoStatusBadge({ roomUrl }: { roomUrl?: string | null }) {
  if (!roomUrl) {
    return (
      <span
        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
        style={{ background: "var(--surface-2)", color: "var(--text-3)" }}
      >
        <VideoOff className="h-3 w-3" /> No room
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: "var(--success-bg)", color: "var(--success)" }}
    >
      <Video className="h-3 w-3" /> Ready
    </span>
  );
}
