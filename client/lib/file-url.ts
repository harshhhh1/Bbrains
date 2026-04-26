"use client"

import { getBaseUrl } from "@/services/api/client"

export function resolveApiFileUrl(fileUrl: string | null | undefined) {
  const normalized = String(fileUrl ?? "").trim()
  if (!normalized) return ""

  let url = normalized
  if (!/^(https?:|data:|blob:)/i.test(normalized)) {
    const baseUrl = getBaseUrl().replace(/\/$/, "")
    const relativePath = normalized.startsWith("/") ? normalized : `/${normalized}`
    url = `${baseUrl}${relativePath}`
  }

  // Handle parameter re-encoding to fix double-encoded Cloudinary/External URLs
  try {
    const urlObj = new URL(url);
    if (urlObj.search) {
      const params = new URLSearchParams(urlObj.search);
      const newParams = new URLSearchParams();
      for (const [key, value] of params) {
        newParams.set(key, decodeURIComponent(value));
      }
      urlObj.search = newParams.toString();
      return urlObj.toString();
    }
    return url;
  } catch {
    return url;
  }
}

export function getFileUrlBase(url: string) {
  return resolveApiFileUrl(url).split(/[?#]/)[0]?.toLowerCase() ?? ""
}
