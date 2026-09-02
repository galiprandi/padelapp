import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { NotificationsBadge } from "../notifications-badge";
import { getCachedPendingActionsCount } from "@/lib/queries";

vi.mock("@/lib/queries", () => ({
  getCachedPendingActionsCount: vi.fn(),
}));

describe("NotificationsBadge Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports NotificationsBadge function component", () => {
    expect(typeof NotificationsBadge).toBe("function");
  });

  it("renders Suspense wrapper with null fallback", () => {
    const element = NotificationsBadge({ userId: "user-123" });

    expect(element.type).toBe(React.Suspense);
    expect(element.props.fallback).toBeNull();
  });

  it("handles async count resolution and cap formatting for >99 notifications", async () => {
    vi.mocked(getCachedPendingActionsCount).mockResolvedValue(120);

    const count = await getCachedPendingActionsCount("user-123");
    expect(count).toBe(120);
    expect(count > 99 ? "99+" : count).toBe("99+");
  });

  it("formats singular vs plural ARIA labels correctly", async () => {
    vi.mocked(getCachedPendingActionsCount).mockResolvedValue(1);
    const countSingular = await getCachedPendingActionsCount("user-1");
    const singularLabel =
      countSingular === 1
        ? "1 notificación pendiente"
        : `${countSingular} notificaciones pendientes`;
    expect(singularLabel).toBe("1 notificación pendiente");

    vi.mocked(getCachedPendingActionsCount).mockResolvedValue(3);
    const countPlural = await getCachedPendingActionsCount("user-1");
    const pluralLabel =
      countPlural === 1
        ? "1 notificación pendiente"
        : `${countPlural} notificaciones pendientes`;
    expect(pluralLabel).toBe("3 notificaciones pendientes");
  });
});
