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

  // cookie readable by middleware
  document.cookie = `token=${auth.token}; path=/; SameSite=Lax`;
}

export function clearAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth");

  // delete cookie
  document.cookie = "token=; Max-Age=0; path=/; SameSite=Lax";
}

export function getToken() {
  return getAuth()?.token ?? null;
}

export function isLoggedIn() {
  return !!getToken();
}
