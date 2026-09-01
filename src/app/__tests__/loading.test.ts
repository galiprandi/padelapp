import { describe, it, expect } from "vitest";
import React from "react";
import RootLoading from "../loading";

describe("RootLoading Skeleton Component", () => {
  it("creates a valid React element for root loading skeleton", () => {
    const element = React.createElement(RootLoading);

    expect(element.type).toBe(RootLoading);
  });

  it("renders with correct accessibility attributes", () => {
    const element = RootLoading();

    expect(element.props["aria-busy"]).toBe("true");
    expect(element.props["aria-label"]).toBe("Cargando Padel Red");
  });

  it("has main container with full height viewport background styling", () => {
    const element = RootLoading();

    expect(element.props.className).toContain("relative flex min-h-dvh flex-col bg-background");
  });
});
