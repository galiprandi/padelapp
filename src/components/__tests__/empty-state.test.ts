import { describe, it, expect } from "vitest";
import React from "react";
import { EmptyState } from "../empty-state";
import { Calendar } from "lucide-react";

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
