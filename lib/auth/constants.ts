export const AUTH_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-admin_session"
    : "admin_session";

export const AUTH_COOKIE_NAMES = [
  "__Host-admin_session",
  "admin_session",
] as const;

export const NORMAL_SESSION_SECONDS = 12 * 60 * 60;
export const REMEMBER_SESSION_SECONDS = 30 * 24 * 60 * 60;
export const THROTTLE_WINDOW_MS = 15 * 60 * 1000;
export const THROTTLE_MAX_FAILURES = 5;
export const SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export const PROTECTED_API_PREFIXES = [
  "/api/users",
  "/api/companies",
  "/api/skills",
  "/api/tags",
  "/api/project-highlights",
  "/api/experiences",
  "/api/projects",
  "/api/posts",
] as const;
