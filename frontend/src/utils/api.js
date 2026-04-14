const envApiUrl = (process.env.REACT_APP_API_URL || "").trim();

function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocalhost) {
    return "http://localhost:5000";
  }

  // In deployed environments, default to same-origin so /api can be proxied.
  return "";
}

const API_BASE_URL = envApiUrl || getDefaultApiBaseUrl();

function buildUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${cleanPath}`;
}

export async function getJson(path) {
  const response = await fetch(buildUrl(path));
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || "Request failed.";
    throw new Error(message);
  }

  return data;
}

export async function postJson(path, payload) {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || "Request failed.";
    throw new Error(message);
  }

  return data;
}

export async function putJson(path, payload) {
  const response = await fetch(buildUrl(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || "Request failed.";
    throw new Error(message);
  }

  return data;
}

export async function deleteJson(path, payload) {
  const response = await fetch(buildUrl(path), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || "Request failed.";
    throw new Error(message);
  }

  return data;
}
