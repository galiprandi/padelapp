import { describe, it, expect } from "vitest";
import React from "react";
import { EmptyState } from "../empty-state";
import {
  getEmptyStateAriaLabel,
  getEmptyStateContainerClasses,
} from "../empty-state-utils";
import { Calendar } from "lucide-react";

describe("EmptyState Helpers", () => {
  describe("getEmptyStateAriaLabel", () => {
    it("formats aria-label with title and description", () => {
      expect(
        getEmptyStateAriaLabel("No hay turnos disponibles", "Creá un turno nuevo."),
      ).toBe("No hay turnos disponibles - Creá un turno nuevo.");
    });

    it("returns trimmed title when description is missing or whitespace", () => {
      expect(getEmptyStateAriaLabel("  Sin partidos  ")).toBe("Sin partidos");
      expect(getEmptyStateAriaLabel("Sin partidos", "   ")).toBe("Sin partidos");
    });
  });

  describe("getEmptyStateContainerClasses", () => {
    it("returns base MDS solid container classes", () => {
      const classes = getEmptyStateContainerClasses();
      expect(classes).toContain("bg-card");
      expect(classes).toContain("border-border");
      expect(classes).toContain("shadow-xs");
    });

    it("merges custom className with base classes", () => {
      const classes = getEmptyStateContainerClasses("my-8 max-w-md");
      expect(classes).toContain("my-8");
      expect(classes).toContain("max-w-md");
      expect(classes).toContain("bg-card");
    });
  });
});

describe("EmptyState Component", () => {
  it("creates valid React element with title and description", () => {
    const element = React.createElement(EmptyState, {
      title: "No hay turnos disponibles",
      description: "Creá un turno nuevo para jugar con tu red.",
    });

    expect(element.type).toBe(EmptyState);
    expect(element.props.title).toBe("No hay turnos disponibles");
    expect(element.props.description).toBe("Creá un turno nuevo para jugar con tu red.");
  });

  it("passes icon and action props correctly", () => {
    const actionButton = React.createElement("button", { key: "cta" }, "Crear turno");
    const element = React.createElement(EmptyState, {
      title: "Sin partidos",
      description: "No tenés partidos confirmados.",
      icon: Calendar,
      action: actionButton,
    });

    expect(element.props.icon).toBe(Calendar);
    expect(element.props.action).toBe(actionButton);
  });

  it("supports custom className extension", () => {
    const element = React.createElement(EmptyState, {
      title: "Sin notificaciones",
      description: "Estás al día.",
      className: "my-8 max-w-md",
    });

    expect(element.props.className).toBe("my-8 max-w-md");
  });
});
