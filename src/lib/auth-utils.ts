/**
 * Return a safe relative redirect URL derived from user-controlled input.
 *
 * Prevents open-redirect attacks by rejecting anything that is not a same-origin
 * relative path. Absolute URLs (https://evil.com) and protocol-relative URLs
 * (//evil.com) are discarded.
 */
export function safeCallbackUrl(url: string | undefined, fallback = "/me"): string {
  if (!url) return fallback;
  if (!url.startsWith("/")) return fallback;
  if (url.startsWith("//")) return fallback;
  return url;
}
