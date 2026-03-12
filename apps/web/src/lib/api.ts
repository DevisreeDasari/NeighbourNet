export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3008";

type ApiError = {
  message?: string;
  issues?: unknown;
};

export async function apiFetch<T>(path: string, init?: RequestInit & { accessToken?: string }) {
  const headers = new Headers(init?.headers);

  const body = init?.body as unknown;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData) {
    headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  }

  if (init?.accessToken) headers.set("Authorization", `Bearer ${init.accessToken}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    body: init?.body,
    headers,
    credentials: "include"
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = (isJson ? await res.json() : await res.text()) as unknown;

  if (!res.ok) {
    const err = (typeof data === "object" && data ? (data as ApiError) : undefined) ?? {};
    throw new Error(err.message || `Request failed (${res.status})`);
  }

  return data as T;
}
