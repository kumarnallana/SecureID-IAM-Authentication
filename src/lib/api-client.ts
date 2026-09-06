/**
 * SecureID Typed Client API Helper
 */

let cachedCsrfToken: string | null = null;
let pendingCsrfPromise: Promise<string | null> | null = null;

export async function getCsrfToken(): Promise<string | null> {
  if (cachedCsrfToken) return cachedCsrfToken;
  if (!pendingCsrfPromise) {
    pendingCsrfPromise = fetch("/api/csrf", {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json().catch(() => ({}));
        cachedCsrfToken = data.csrfToken || null;
        return cachedCsrfToken;
      })
      .catch(() => null)
      .finally(() => {
        pendingCsrfPromise = null;
      });
  }
  return pendingCsrfPromise;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
  csrf?: boolean;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, string>;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = endpoint.startsWith("/api") ? endpoint : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const method = (options.method || "POST").toUpperCase();
  const needsCsrf = options.csrf !== false && !["GET", "HEAD", "OPTIONS"].includes(method);
  
  const token = needsCsrf ? await getCsrfToken() : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["X-CSRF-Token"] = token;
  }

  const config: RequestInit = {
    method,
    credentials: options.credentials || "same-origin",
    headers,
  };

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  } else if (options.body) {
    config.body = options.body;
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error: ApiError = new Error(data.message || "An unexpected error occurred.");
      error.status = res.status;
      error.code = data.code || "REQUEST_FAILED";
      error.details = data.details || {};
      throw error;
    }

    return data as T;
  } catch (err: any) {
    if (err.status) throw err;
    const networkError: ApiError = new Error("Network error. Please check your connection.");
    networkError.status = 0;
    networkError.code = "NETWORK_ERROR";
    networkError.details = {};
    throw networkError;
  }
}
