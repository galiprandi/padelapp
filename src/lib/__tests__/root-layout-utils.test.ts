import { describe, expect, it } from "vitest";
import {
  getRootBodyClasses,
  getRootHtmlAttributes,
  getRootLoadingAriaLabel,
  getRootLoadingClasses,
  getRootLoadingInnerContainerClasses,
  getRootLoadingHeroClasses,
  getRootLoadingHeroTextClasses,
  getRootLoadingCardClasses,
  getRootLoadingCtaClasses,
  getRootLoadingFeaturesListClasses,
  getRootLoadingCardContentClasses,
  getRootLoadingFeatureCardKeys,
  getRootLoadingHeroAvatarSkeletonClasses,
  getRootLoadingHeroTitleSkeletonClasses,
  getRootLoadingHeroSubtitleSkeletonClasses,
  getRootLoadingHeroTaglineSkeletonClasses,
  getRootLoadingCardIconSkeletonClasses,
  getRootLoadingCardTitleSkeletonClasses,
  getRootLoadingCardTextSkeletonClasses,
  getRootLoadingCardSubtextSkeletonClasses,
  getRootLoadingCtaButtonSkeletonClasses,
  getRootLoadingCtaFooterSkeletonClasses,
} from "../root-layout-utils";

describe("root-layout-utils", () => {
  describe("getRootBodyClasses", () => {
    it("returns body classes including font variable when provided", () => {
      const classes = getRootBodyClasses("--font-geist-sans");
      expect(classes).toContain("--font-geist-sans");
      expect(classes).toContain("min-h-screen bg-background font-sans text-foreground");
    });

    it("returns body classes without font variable when omitted or empty", () => {
      const classes = getRootBodyClasses();
      expect(classes).toBe("min-h-screen bg-background font-sans text-foreground");
    });

    it("trims whitespace correctly when font variable has trailing spaces", () => {
      const classes = getRootBodyClasses("  --custom-font  ");
      expect(classes).toBe("--custom-font min-h-screen bg-background font-sans text-foreground");
    });
  });

  describe("getRootHtmlAttributes", () => {
    it("returns Spanish language attribute for root html element", () => {
      const attrs = getRootHtmlAttributes();
      expect(attrs).toEqual({ lang: "es" });
    });
  });

  describe("getRootLoadingAriaLabel", () => {
    it("returns localized Spanish screen reader text for root loading state", () => {
      const label = getRootLoadingAriaLabel();
      expect(label).toBe("Cargando Padel Red");
    });
  });

  describe("getRootLoadingClasses", () => {
    it("returns CSS layout classes for root loading skeleton container", () => {
      const classes = getRootLoadingClasses();
      expect(classes).toContain("relative flex min-h-dvh flex-col bg-background px-6 py-10");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingClasses("custom-root-loading");
      expect(classes).toContain("custom-root-loading");
    });
  });

  describe("getRootLoadingInnerContainerClasses", () => {
    it("returns inner container classes", () => {
      const classes = getRootLoadingInnerContainerClasses();
      expect(classes).toContain("flex w-full max-w-sm mx-auto flex-col gap-6");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingInnerContainerClasses("custom-inner-container");
      expect(classes).toContain("custom-inner-container");
    });
  });

  describe("getRootLoadingHeroClasses", () => {
    it("returns hero section layout classes", () => {
      const classes = getRootLoadingHeroClasses();
      expect(classes).toContain("flex flex-col items-center gap-4 pt-6");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingHeroClasses("custom-hero");
      expect(classes).toContain("custom-hero");
    });
  });

  describe("getRootLoadingHeroTextClasses", () => {
    it("returns hero text container classes", () => {
      const classes = getRootLoadingHeroTextClasses();
      expect(classes).toContain("space-y-2 text-center flex flex-col items-center w-full");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingHeroTextClasses("custom-hero-text");
      expect(classes).toContain("custom-hero-text");
    });
  });

  describe("getRootLoadingCardClasses", () => {
    it("returns feature card container classes", () => {
      const classes = getRootLoadingCardClasses();
      expect(classes).toContain("flex items-start gap-3 rounded-xl border border-border bg-card p-4");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingCardClasses("custom-card");
      expect(classes).toContain("custom-card");
    });
  });

  describe("getRootLoadingCtaClasses", () => {
    it("returns CTA section container classes", () => {
      const classes = getRootLoadingCtaClasses();
      expect(classes).toContain("flex flex-col gap-3 pt-2");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingCtaClasses("custom-cta");
      expect(classes).toContain("custom-cta");
    });
  });

  describe("getRootLoadingFeaturesListClasses", () => {
    it("returns feature list container classes", () => {
      const classes = getRootLoadingFeaturesListClasses();
      expect(classes).toContain("flex flex-col gap-3");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingFeaturesListClasses("custom-features-list");
      expect(classes).toContain("custom-features-list");
    });
  });

  describe("getRootLoadingCardContentClasses", () => {
    it("returns card content container classes", () => {
      const classes = getRootLoadingCardContentClasses();
      expect(classes).toContain("space-y-2 flex-1 pt-1");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingCardContentClasses("custom-card-content");
      expect(classes).toContain("custom-card-content");
    });
  });

  describe("getRootLoadingFeatureCardKeys", () => {
    it("returns feature card keys array", () => {
      const keys = getRootLoadingFeatureCardKeys();
      expect(keys).toEqual([1, 2, 3]);
    });
  });

  describe("getRootLoadingHeroAvatarSkeletonClasses", () => {
    it("returns hero avatar skeleton classes", () => {
      const classes = getRootLoadingHeroAvatarSkeletonClasses();
      expect(classes).toContain("h-20 w-20 rounded-2xl");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingHeroAvatarSkeletonClasses("custom-avatar");
      expect(classes).toContain("custom-avatar");
    });
  });

  describe("getRootLoadingHeroTitleSkeletonClasses", () => {
    it("returns hero title skeleton classes", () => {
      const classes = getRootLoadingHeroTitleSkeletonClasses();
      expect(classes).toContain("h-8 w-3/4 rounded-lg");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingHeroTitleSkeletonClasses("custom-title");
      expect(classes).toContain("custom-title");
    });
  });

  describe("getRootLoadingHeroSubtitleSkeletonClasses", () => {
    it("returns hero subtitle skeleton classes", () => {
      const classes = getRootLoadingHeroSubtitleSkeletonClasses();
      expect(classes).toContain("h-5 w-1/3 rounded-md");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingHeroSubtitleSkeletonClasses("custom-subtitle");
      expect(classes).toContain("custom-subtitle");
    });
  });

  describe("getRootLoadingHeroTaglineSkeletonClasses", () => {
    it("returns hero tagline skeleton classes", () => {
      const classes = getRootLoadingHeroTaglineSkeletonClasses();
      expect(classes).toContain("h-4 w-5/6 rounded-md");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingHeroTaglineSkeletonClasses("custom-tagline");
      expect(classes).toContain("custom-tagline");
    });
  });

  describe("getRootLoadingCardIconSkeletonClasses", () => {
    it("returns card icon skeleton classes", () => {
      const classes = getRootLoadingCardIconSkeletonClasses();
      expect(classes).toContain("h-10 w-10 shrink-0 rounded-lg");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingCardIconSkeletonClasses("custom-icon");
      expect(classes).toContain("custom-icon");
    });
  });

  describe("getRootLoadingCardTitleSkeletonClasses", () => {
    it("returns card title skeleton classes", () => {
      const classes = getRootLoadingCardTitleSkeletonClasses();
      expect(classes).toContain("h-4 w-1/2 rounded-md");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingCardTitleSkeletonClasses("custom-card-title");
      expect(classes).toContain("custom-card-title");
    });
  });

  describe("getRootLoadingCardTextSkeletonClasses", () => {
    it("returns card text skeleton classes", () => {
      const classes = getRootLoadingCardTextSkeletonClasses();
      expect(classes).toContain("h-3 w-full rounded-md");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingCardTextSkeletonClasses("custom-card-text");
      expect(classes).toContain("custom-card-text");
    });
  });

  describe("getRootLoadingCardSubtextSkeletonClasses", () => {
    it("returns card subtext skeleton classes", () => {
      const classes = getRootLoadingCardSubtextSkeletonClasses();
      expect(classes).toContain("h-3 w-4/5 rounded-md");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingCardSubtextSkeletonClasses("custom-card-subtext");
      expect(classes).toContain("custom-card-subtext");
    });
  });

  describe("getRootLoadingCtaButtonSkeletonClasses", () => {
    it("returns CTA button skeleton classes", () => {
      const classes = getRootLoadingCtaButtonSkeletonClasses();
      expect(classes).toContain("h-12 w-full rounded-lg");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingCtaButtonSkeletonClasses("custom-cta-button");
      expect(classes).toContain("custom-cta-button");
    });
  });

  describe("getRootLoadingCtaFooterSkeletonClasses", () => {
    it("returns CTA footer skeleton classes", () => {
      const classes = getRootLoadingCtaFooterSkeletonClasses();
      expect(classes).toContain("h-3 w-2/3 mx-auto rounded-md");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingCtaFooterSkeletonClasses("custom-cta-footer");
      expect(classes).toContain("custom-cta-footer");
    });
  });
});
