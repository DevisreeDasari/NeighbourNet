import { API_URL } from "./api";

export function resolveMediaUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
}
