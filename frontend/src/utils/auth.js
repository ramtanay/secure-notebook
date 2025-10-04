// src/utils/auth.js

// ✅ Check if user token exists and is still valid
export function isTokenValid() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // JWT expiration time in ms
    return Date.now() < exp;
  } catch {
    return false;
  }
}

// ✅ Simple check for user auth
export function isUserAuthenticated() {
  return !!localStorage.getItem('token');
}
