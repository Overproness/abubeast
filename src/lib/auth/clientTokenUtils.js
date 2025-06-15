/**
 * Client-side utilities for token handling
 */

// Simple check if a token is present in cookies
export function hasAuthCookie() {
  if (typeof document === "undefined") return false;

  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  return cookies.some((cookie) => cookie.startsWith("token="));
}

// Parse JWT token without verification (for client-side display only)
export function parseJwt(token) {
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT", e);
    return null;
  }
}
