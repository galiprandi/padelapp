export interface PushSubscribePayloadValidation {
  isValid: boolean;
  token?: string;
  error?: string;
}

export function validatePushSubscribePayload(
  body: unknown
): PushSubscribePayloadValidation {
  if (!body || typeof body !== "object") {
    return { isValid: false, error: "Token required" };
  }

  const payload = body as Record<string, unknown>;
  const token = payload.token;

  if (typeof token !== "string" || token.trim().length === 0) {
    return { isValid: false, error: "Token required" };
  }

  return {
    isValid: true,
    token: token.trim(),
  };
}

export function getPushSubscribeUnauthorizedResponseBody(): { error: string } {
  return { error: "Unauthorized" };
}

export function getPushSubscribeBadRequestResponseBody(
  error?: string
): { error: string } {
  return { error: error || "Token required" };
}

export function getPushSubscribeSuccessResponseBody(): { ok: boolean } {
  return { ok: true };
}

export function getPushSubscribeErrorResponseBody(): { error: string } {
  return { error: "Internal server error" };
}

export function getPushSubscribeLogMessage(
  action: "unsubscribe_stale" | "subscribe_success" | "subscribe_error",
  userId: string,
  tokenPreview?: string
): string {
  const safeToken = tokenPreview ? `${tokenPreview.slice(0, 10)}...` : "";
  switch (action) {
    case "unsubscribe_stale":
      return `[PushSubscribe] Cleaned up stale token mapping for user ${userId} (token: ${safeToken})`;
    case "subscribe_success":
      return `[PushSubscribe] Saved FCM push subscription for user ${userId} (token: ${safeToken})`;
    case "subscribe_error":
      return `[PushSubscribe] Error saving FCM push subscription for user ${userId}`;
  }
}
