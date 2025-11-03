// lib/auth.js
export function getAuth() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(auth) {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth", JSON.stringify(auth));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth");
}

export function getToken() {
  return getAuth()?.token ?? null;
}

export function isLoggedIn() {
  return !!getToken();
}
