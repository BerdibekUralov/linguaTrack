// SERVER-ONLY — Daily.co REST API helpers
const DAILY_API = "https://api.daily.co/v1";
const DAILY_KEY = process.env.DAILY_API_KEY ?? "";

export function isDailyConfigured() {
  return Boolean(DAILY_KEY && process.env.NEXT_PUBLIC_DAILY_DOMAIN);
}

interface DailyRoom {
  id:       string;
  name:     string;
  url:      string;
  privacy:  string;
}

/** Create a new Daily.co room */
export async function createRoom(name: string, expirySeconds = 86_400): Promise<DailyRoom> {
  if (!DAILY_KEY) throw new Error("DAILY_API_KEY not configured");

  const res = await fetch(`${DAILY_API}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DAILY_KEY}`,
    },
    body: JSON.stringify({
      name,
      privacy: "public",
      properties: {
        exp:                Math.floor(Date.now() / 1000) + expirySeconds,
        enable_chat:        true,
        enable_screenshare: true,
        start_video_off:    false,
        start_audio_off:    false,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Daily.co room creation failed: ${err}`);
  }

  return res.json() as Promise<DailyRoom>;
}

/** Delete a room by name */
export async function deleteRoom(name: string) {
  if (!DAILY_KEY) return;
  await fetch(`${DAILY_API}/rooms/${name}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${DAILY_KEY}` },
  });
}

/** Get room info — returns null if not found */
export async function getRoom(name: string): Promise<DailyRoom | null> {
  if (!DAILY_KEY) return null;
  const res = await fetch(`${DAILY_API}/rooms/${name}`, {
    headers: { "Authorization": `Bearer ${DAILY_KEY}` },
  });
  if (res.status === 404) return null;
  return res.json() as Promise<DailyRoom>;
}
