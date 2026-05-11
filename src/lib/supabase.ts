"use client";
// Client-safe Supabase instance — use in "use client" components only
import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Returns null if env vars not configured yet
export const supabase = url && anon ? createClient(url, anon) : null;

export function chatChannel(userId1: string, userId2: string) {
  const name = [userId1, userId2].sort().join(":");
  return `chat:${name}`;
}
