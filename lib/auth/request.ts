const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const MAX_CLIENT_ADDRESS_LENGTH = 256;
const DEFAULT_ADMIN_REDIRECT = "/admin/projects";

export function getSafeRedirectPath(value: unknown) {
  const baseUrl = new URL("http://localhost");

  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return DEFAULT_ADMIN_REDIRECT;
  }

  try {
    const redirectUrl = new URL(value, baseUrl);

    if (redirectUrl.origin !== baseUrl.origin) {
      return DEFAULT_ADMIN_REDIRECT;
    }

    return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
  } catch {
    return DEFAULT_ADMIN_REDIRECT;
  }
}

export function validateSameOrigin(request: Request) {
  if (SAFE_METHODS.has(request.method.toUpperCase())) {
    return true;
  }

  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function getClientAddress(request: Request) {
  const forwardedAddress = request.headers
    .get("x-forwarded-for")
    ?.split(",", 1)[0];
  const address =
    forwardedAddress ?? request.headers.get("x-real-ip") ?? "unknown";

  return address.trim().slice(0, MAX_CLIENT_ADDRESS_LENGTH) || "unknown";
}
