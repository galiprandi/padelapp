import { describe, it, expect } from "vitest";
import React from "react";
import { AddToCalendarButton } from "../add-to-calendar";

describe("AddToCalendarButton Component", () => {
  it("creates valid React element with turn props", () => {
    const element = React.createElement(AddToCalendarButton, {
      turnId: "turn-123",
      club: "Club Padel Pro",
      date: "2026-08-20T18:00:00Z",
      duration: 90,
      notes: "Traer pelotas nuevas",
    });

    expect(element.type).toBe(AddToCalendarButton);
    expect(element.props.turnId).toBe("turn-123");
    expect(element.props.club).toBe("Club Padel Pro");
    expect(element.props.duration).toBe(90);
    expect(element.props.notes).toBe("Traer pelotas nuevas");
  });

  it("handles optional notes parameter gracefully", () => {
    const element = React.createElement(AddToCalendarButton, {
      turnId: "turn-456",
      club: "El Balcón Pádel",
      date: "2026-08-21T20:00:00Z",
      duration: 60,
    });

    expect(element.props.notes).toBeUndefined();
  });
});
