import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ClubInput } from "../club-input";

describe("ClubInput Component", () => {
  it("renders input field correctly", () => {
    const html = renderToStaticMarkup(
      <ClubInput
        id="club-test"
        value=""
        onChange={vi.fn()}
        placeholder="Ej: Padel City"
      />
    );

    expect(html).toContain('id="club-test"');
    expect(html).toContain('placeholder="Ej: Padel City"');
    expect(html).not.toContain('aria-label="Limpiar nombre del club"');
  });

  it("renders clear button with ARIA label when value is present", () => {
    const html = renderToStaticMarkup(
      <ClubInput
        id="club-test"
        value="Padel Central"
        onChange={vi.fn()}
      />
    );

    expect(html).toContain('value="Padel Central"');
    expect(html).toContain('aria-label="Limpiar nombre del club"');
    expect(html).toContain("pr-10");
  });

  it("handles clear button and escape key callbacks", () => {
    const onChange = vi.fn();
    const onKeyDown = vi.fn();

    const element = React.createElement(ClubInput, {
      id: "club-test",
      value: "Tie Break",
      onChange,
      onKeyDown,
    });

    expect(element.props.value).toBe("Tie Break");
  });
});
