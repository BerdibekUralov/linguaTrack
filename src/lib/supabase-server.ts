// SERVER-ONLY — never import in "use client" components
import { createClient } from "@supabase/supabase-js";

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL      ?? "";
const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseAdmin = url && service
  ? createClient(url, service, { auth: { persistSession: false } })
  : null;

/** Broadcast a new message event to the chat channel */
export async function broadcastMessage(
  userId1: string,
  userId2: string,
  payload: Record<string, unknown>
) {
  if (!supabaseAdmin) return; // Supabase not configured

  const channelName = `chat:${[userId1, userId2].sort().join(":")}`;

  // Supabase Realtime REST broadcast endpoint
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
      },
      body: JSON.stringify({
        messages: [{ topic: channelName, event: "new-message", payload }],
      }),
    }
  );
  if (!res.ok) {
    console.error("[Supabase broadcast] failed:", await res.text());
  }
}
