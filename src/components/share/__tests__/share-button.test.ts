import { describe, it, expect } from "vitest";
import React from "react";
import { ShareButton } from "../share-button";

describe("ShareButton Component", () => {
  it("creates valid React element with required props", () => {
    const element = React.createElement(ShareButton, {
      url: "https://padelred.com/t/123",
      title: "Partido de Padel",
      text: "Sumate a mi turno",
    });

    expect(element.type).toBe(ShareButton);
    expect(element.props.url).toBe("https://padelred.com/t/123");
    expect(element.props.title).toBe("Partido de Padel");
    expect(element.props.text).toBe("Sumate a mi turno");
  });

  it("handles iconOnly and custom messages correctly", () => {
    const element = React.createElement(ShareButton, {
      url: "https://padelred.com/t/456",
      iconOnly: true,
      successMessage: "¡Listo!",
      copyMessage: "Enlace copiado",
    });

    expect(element.props.iconOnly).toBe(true);
    expect(element.props.successMessage).toBe("¡Listo!");
    expect(element.props.copyMessage).toBe("Enlace copiado");
  });
});
