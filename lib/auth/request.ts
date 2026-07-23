const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const MAX_CLIENT_ADDRESS_LENGTH = 256;

export function getSafeRedirectPath(value: unknown) {
  const baseUrl = new URL("http://localhost");

  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/admin";
  }

  try {
    const redirectUrl = new URL(value, baseUrl);

    if (redirectUrl.origin !== baseUrl.origin) {
      return "/admin";
    }

    return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
  } catch {
    return "/admin";
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
