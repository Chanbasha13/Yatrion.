/**
 * Safe Redirect Validation Utility
 * Defends against Open Redirect Vulnerabilities (CWE-601)
 */

const DEFAULT_REDIRECT = "/app/dashboard";

/**
 * Validates and sanitizes a target redirect URL.
 * Strictly guarantees that the destination is an internal application path.
 */
export function getSafeRedirectUrl(
  requestedUrl: string | null | undefined,
  defaultUrl: string = DEFAULT_REDIRECT
): string {
  if (!requestedUrl || typeof requestedUrl !== "string") {
    return defaultUrl;
  }

  const trimmed = requestedUrl.trim();

  // Must not be empty
  if (!trimmed) {
    return defaultUrl;
  }

  // Must start with exactly one forward slash
  if (!trimmed.startsWith("/")) {
    return defaultUrl;
  }

  // Reject protocol-relative URLs (e.g. "//evil.com" or "///evil.com")
  if (trimmed.startsWith("//")) {
    return defaultUrl;
  }

  // Reject backslash variations (e.g. "/\evil.com" or "/\/\")
  if (trimmed.includes("\\")) {
    return defaultUrl;
  }

  // Reject control characters, newlines, and null bytes
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) {
    return defaultUrl;
  }

  // Reject javascript:, data:, or vbscript: pseudoprotocols
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("javascript:") ||
    lower.includes("data:") ||
    lower.includes("vbscript:")
  ) {
    return defaultUrl;
  }

  // Ensure there is no scheme before query or hash (e.g. "/path:http://...")
  const pathPart = trimmed.split(/[?#]/)[0];
  if (pathPart.includes(":")) {
    return defaultUrl;
  }

  return trimmed;
}

