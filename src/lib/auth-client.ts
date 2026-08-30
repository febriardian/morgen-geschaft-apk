import * as SecureStore from "expo-secure-store";

export type AuthUser = { uid: string; email: string };
type AuthSession = AuthUser & {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
};

const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "";
const SESSION_KEY = "mg_mobile_auth_session";
let memorySession: AuthSession | null = null;

function assertConfigured() {
  if (!API_KEY)
    throw new Error(
      "Firebase client API key belum dikonfigurasi pada aplikasi.",
    );
}

async function persist(session: AuthSession | null) {
  memorySession = session;
  if (session)
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  else await SecureStore.deleteItemAsync(SESSION_KEY);
}

async function readStoredSession() {
  if (memorySession) return memorySession;
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    memorySession = raw ? JSON.parse(raw) : null;
    return memorySession;
  } catch {
    return null;
  }
}

async function refreshSession(session: AuthSession) {
  assertConfigured();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: session.refreshToken,
  });
  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
  );
  const data = await response.json();
  if (!response.ok) {
    await persist(null);
    throw new Error("Sesi akun sudah berakhir. Silakan masuk kembali.");
  }
  const next: AuthSession = {
    ...session,
    uid: String(data.user_id || session.uid),
    idToken: String(data.id_token || ""),
    refreshToken: String(data.refresh_token || session.refreshToken),
    expiresAt:
      Date.now() + Math.max(60, Number(data.expires_in || 3600) - 60) * 1000,
  };
  await persist(next);
  return next;
}

export async function restoreAuthSession(): Promise<AuthUser | null> {
  const session = await readStoredSession();
  if (!session) return null;
  try {
    const valid =
      session.expiresAt > Date.now() + 30_000
        ? session
        : await refreshSession(session);
    return { uid: valid.uid, email: valid.email };
  } catch {
    return null;
  }
}

export async function signInWithFirebaseCustomToken(
  customToken: string,
  email: string,
): Promise<AuthUser> {
  assertConfigured();
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      String(data?.error?.message || "Sesi akun belum dapat dibuat."),
    );
  const session: AuthSession = {
    uid: String(data.localId || ""),
    email: email.trim().toLowerCase(),
    idToken: String(data.idToken || ""),
    refreshToken: String(data.refreshToken || ""),
    expiresAt:
      Date.now() + Math.max(60, Number(data.expiresIn || 3600) - 60) * 1000,
  };
  if (!session.idToken || !session.refreshToken)
    throw new Error("Respons autentikasi tidak lengkap.");
  await persist(session);
  return { uid: session.uid, email: session.email };
}

export async function getValidIdToken() {
  const session = await readStoredSession();
  if (!session) return "";
  if (session.expiresAt > Date.now() + 30_000) return session.idToken;
  return (await refreshSession(session)).idToken;
}

export async function clearAuthSession() {
  await persist(null);
}
