"use client";

export type UploadedAsset = {
  url: string;
  fileName?: string;
  fileType?: string;
  thumbnailUrl?: string;
  storage?: "cloudinary" | "local";
};

function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export async function refreshAccessToken() {
  const res = await fetch("/api/auth/refresh", { method: "POST" });
  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  if (!data || typeof data.accessToken !== "string") return null;

  localStorage.setItem("accessToken", data.accessToken);
  return data.accessToken;
}

export async function readApiError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  if (data && typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }
  return fallback;
}

export async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const makeInit = (token: string | null): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token || ""}`,
    },
  });

  let response = await fetch(input, makeInit(getStoredAccessToken()));

  if (response.status === 401) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      response = await fetch(input, makeInit(refreshedToken));
    }
  }

  return response;
}

export async function uploadAsset(file: File, folder?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) formData.append("folder", folder);

  const response = await fetchWithAuth("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Upload failed. Please try again."));
  }

  const asset = (await response.json().catch(() => null)) as UploadedAsset | null;
  if (!asset?.url) {
    throw new Error("Upload finished, but no asset URL was returned.");
  }

  return asset;
}
