import { describe, it, expect, vi } from "vitest";
import React from "react";
import NotificationsLoading from "../loading";
import {
  getNotificationsSkeletonAriaLabel,
  getNotificationsRegionAriaLabel,
  getNotificationsHeadingTitle,
} from "@/components/navigation/nav-utils";

describe("Notifications Loading Component", () => {
  it("renders loading region landmark with aria-busy and accessible ARIA label", () => {
    const element = NotificationsLoading();

    expect(element.props.role).toBe("region");
    expect(element.props["aria-busy"]).toBe("true");
    expect(element.props["aria-label"]).toBe(
      getNotificationsSkeletonAriaLabel(),
    );
  });
});

describe("Notifications Utilities Integration", () => {
  it("exports correct region aria label for notifications page", () => {
    expect(getNotificationsRegionAriaLabel()).toBe(
      "Sección de notificaciones y acciones pendientes",
    );
  });

  it("exports correct title for notifications heading", () => {
    expect(getNotificationsHeadingTitle()).toBe("Notificaciones");
  });
});
