import { describe, expect, it } from "vitest";
import { ToastProvider, useToastContext } from "../toast-provider";

describe("ToastProvider", () => {
  it("exports ToastProvider component function and useToastContext hook", () => {
    expect(typeof ToastProvider).toBe("function");
    expect(typeof useToastContext).toBe("function");
  });

  it("throws error when useToastContext is invoked outside React component context", () => {
    expect(() => useToastContext()).toThrow();
  });
});
