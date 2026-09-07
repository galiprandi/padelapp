import { describe, it, expect } from "vitest";
import React from "react";
import { Skeleton } from "../skeleton";

describe("Skeleton Component", () => {
  it("creates valid React element with custom className", () => {
    const element = React.createElement(Skeleton, {
      className: "h-12 w-full rounded-lg",
    });

    expect(element.type).toBe(Skeleton);
    expect(element.props.className).toBe("h-12 w-full rounded-lg");
  });

  it("applies default aria-hidden='true' for decorative placeholder skeletons", () => {
    const element = Skeleton({
      className: "h-4 w-32",
    });

    expect(element.props["aria-hidden"]).toBe("true");
    expect(element.props.className).toContain("animate-pulse");
    expect(element.props.className).toContain("bg-muted");
  });

  it("omits default aria-hidden when role or aria-label is provided", () => {
    const elementWithRole = Skeleton({
      role: "status",
      "aria-label": "Cargando información del partido",
    });

    expect(elementWithRole.props["aria-hidden"]).toBeUndefined();
    expect(elementWithRole.props.role).toBe("status");
    expect(elementWithRole.props["aria-label"]).toBe("Cargando información del partido");

    const elementWithLabelledBy = Skeleton({
      "aria-labelledby": "skeleton-heading-id",
    });

    expect(elementWithLabelledBy.props["aria-hidden"]).toBeUndefined();
    expect(elementWithLabelledBy.props["aria-labelledby"]).toBe("skeleton-heading-id");
  });

  it("honors explicit aria-hidden override props", () => {
    const explicitFalse = Skeleton({
      "aria-hidden": "false",
    });

    expect(explicitFalse.props["aria-hidden"]).toBe("false");

    const explicitTrueWithRole = Skeleton({
      role: "status",
      "aria-hidden": "true",
    });

    expect(explicitTrueWithRole.props["aria-hidden"]).toBe("true");
  });
});
