import { getValidIdToken } from "@/lib/auth-client";
import { API_BASE } from "@/constants/store";

type ApiOptions = RequestInit & {
  auth?: boolean;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    data: Record<string, unknown> = {},
  ) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function api<T = Record<string, unknown>>(
  path: string,
  options: ApiOptions = {},
) {
  const {
    auth: needsAuth,
    timeoutMs = 20000,
    headers,
    ...requestOptions
  } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const token = needsAuth ? await getValidIdToken() : "";

  try {
    const response = await fetch(
      `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`,
      {
        ...requestOptions,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...(requestOptions.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
      },
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const data = (isJson ? await response.json() : {}) as Record<
      string,
      unknown
    >;
    if (!response.ok) {
      throw new ApiError(
        String(data.error || "Permintaan belum dapat diproses."),
        response.status,
        data,
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if ((error as Error)?.name === "AbortError")
      throw new Error("Koneksi terlalu lama. Coba lagi.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function makeIdempotencyKey() {
  const random = Math.random().toString(36).slice(2);
  return `mobile_${Date.now()}_${random}`;
}
