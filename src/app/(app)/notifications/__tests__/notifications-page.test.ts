import { describe, it, expect, vi } from "vitest";
import React from "react";
import NotificationsLoading from "../loading";
import {
  getNotificationsSkeletonAriaLabel,
  getNotificationsRegionAriaLabel,
  getNotificationsHeadingTitle,
  getNotificationsHeaderClasses,
  getNotificationsContainerClasses,
  getNotificationsActionsBadgeClasses,
  getNotificationsListClasses,
  getPendingActionMatchDetailProps,
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

  it("provides header, container, badge and list class composition helpers", () => {
    expect(getNotificationsHeaderClasses()).toBe("flex flex-col gap-6");
    expect(getNotificationsContainerClasses()).toBe("space-y-3");
    expect(getNotificationsActionsBadgeClasses()).toBe(
      "rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground",
    );
    expect(getNotificationsListClasses()).toBe("space-y-2");
  });

  it("formats pending action detail URL and label based on score presence", () => {
    expect(getPendingActionMatchDetailProps({ id: "m1" })).toEqual({
      detailUrl: "/match/m1/result",
      label: "Cargar resultado",
    });
    expect(
      getPendingActionMatchDetailProps({ id: "m2", score: { set1: "6-2" } }),
    ).toEqual({
      detailUrl: "/match/m2",
      label: "Confirmar",
    });
  });
});
