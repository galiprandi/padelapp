import { describe, expect, it } from "vitest";
import {
  validatePushSubscribePayload,
  getPushSubscribeUnauthorizedResponseBody,
  getPushSubscribeBadRequestResponseBody,
  getPushSubscribeSuccessResponseBody,
  getPushSubscribeErrorResponseBody,
  getPushSubscribeLogMessage,
} from "../subscribe-utils";

describe("push subscribe utils", () => {
  describe("validatePushSubscribePayload", () => {
    it("returns invalid for null, undefined or non-object inputs", () => {
      expect(validatePushSubscribePayload(null)).toEqual({
        isValid: false,
        error: "Token required",
      });
      expect(validatePushSubscribePayload(undefined)).toEqual({
        isValid: false,
        error: "Token required",
      });
      expect(validatePushSubscribePayload("not an object")).toEqual({
        isValid: false,
        error: "Token required",
      });
      expect(validatePushSubscribePayload(123)).toEqual({
        isValid: false,
        error: "Token required",
      });
    });

    it("returns invalid when token property is missing or not a string", () => {
      expect(validatePushSubscribePayload({})).toEqual({
        isValid: false,
        error: "Token required",
      });
      expect(validatePushSubscribePayload({ token: 12345 })).toEqual({
        isValid: false,
        error: "Token required",
      });
      expect(validatePushSubscribePayload({ token: null })).toEqual({
        isValid: false,
        error: "Token required",
      });
    });

    it("returns invalid when token is empty or whitespace only", () => {
      expect(validatePushSubscribePayload({ token: "" })).toEqual({
        isValid: false,
        error: "Token required",
      });
      expect(validatePushSubscribePayload({ token: "   " })).toEqual({
        isValid: false,
        error: "Token required",
      });
    });

    it("returns valid and trimmed token for valid inputs", () => {
      expect(validatePushSubscribePayload({ token: "fcm-token-123" })).toEqual({
        isValid: true,
        token: "fcm-token-123",
      });
      expect(validatePushSubscribePayload({ token: "  fcm-token-456  " })).toEqual({
        isValid: true,
        token: "fcm-token-456",
      });
    });
  });

  describe("response body generators", () => {
    it("getPushSubscribeUnauthorizedResponseBody returns unauthorized payload", () => {
      expect(getPushSubscribeUnauthorizedResponseBody()).toEqual({
        error: "Unauthorized",
      });
    });

    it("getPushSubscribeBadRequestResponseBody returns bad request payload", () => {
      expect(getPushSubscribeBadRequestResponseBody()).toEqual({
        error: "Token required",
      });
      expect(
        getPushSubscribeBadRequestResponseBody("Custom error message")
      ).toEqual({
        error: "Custom error message",
      });
    });

    it("getPushSubscribeSuccessResponseBody returns ok payload", () => {
      expect(getPushSubscribeSuccessResponseBody()).toEqual({ ok: true });
    });

    it("getPushSubscribeErrorResponseBody returns server error payload", () => {
      expect(getPushSubscribeErrorResponseBody()).toEqual({
        error: "Internal server error",
      });
    });
  });

  describe("getPushSubscribeLogMessage", () => {
    it("formats unsubscribe_stale log message", () => {
      const log = getPushSubscribeLogMessage(
        "unsubscribe_stale",
        "user-1",
        "fcm-token-long-value"
      );
      expect(log).toBe(
        "[PushSubscribe] Cleaned up stale token mapping for user user-1 (token: fcm-token-...)"
      );
    });

    it("formats subscribe_success log message", () => {
      const log = getPushSubscribeLogMessage(
        "subscribe_success",
        "user-2",
        "sample-token"
      );
      expect(log).toBe(
        "[PushSubscribe] Saved FCM push subscription for user user-2 (token: sample-tok...)"
      );
    });

    it("formats subscribe_error log message", () => {
      const log = getPushSubscribeLogMessage("subscribe_error", "user-3");
      expect(log).toBe(
        "[PushSubscribe] Error saving FCM push subscription for user user-3"
      );
    });
  });
});
