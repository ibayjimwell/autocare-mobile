// utils/jwt.js
export function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Replace URL-safe characters and decode Base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (err) {
    console.error('JWT decode error:', err);
    return null;
  }
}