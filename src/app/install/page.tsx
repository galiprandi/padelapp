import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InstallContent } from "@/components/share/install-content";
import {
  getInstallPageAriaLabel,
  getInstallPageTitle,
  getInstallPageDescription,
  getInstallPageLogoAltText,
  getInstallPageBackAriaLabel,
  getInstallPageBackLinkClasses,
  getInstallPageMainClasses,
  getInstallPageContainerClasses,
  getInstallPageLogoClasses,
  getInstallPageHeaderClasses,
  getInstallPageTitleClasses,
  getInstallPageDescriptionClasses,
  getInstallPageContentWrapperClasses,
  getInstallPageBackLinkText,
} from "@/components/share/install-utils";
import Image from "next/image";

export default function InstallPage() {
  return (
    <main
      role="region"
      aria-label={getInstallPageAriaLabel()}
      className={getInstallPageMainClasses()}
    >
      <div className={getInstallPageContainerClasses()}>
        {/* Logo */}
        <Image
          src="/icon.svg"
          alt={getInstallPageLogoAltText()}
          className={getInstallPageLogoClasses()}
          width={80}
          height={80}
          unoptimized
        />

        <div className={getInstallPageHeaderClasses()}>
          <h1 className={getInstallPageTitleClasses()}>
            {getInstallPageTitle()}
          </h1>
          <p className={getInstallPageDescriptionClasses()}>
            {getInstallPageDescription()}
          </p>
        </div>

        <div className={getInstallPageContentWrapperClasses()}>
          <InstallContent />
        </div>

        <Button
          variant="ghost"
          className={getInstallPageBackLinkClasses()}
          asChild
        >
          <Link href="/" prefetch={true} aria-label={getInstallPageBackAriaLabel()}>
            {getInstallPageBackLinkText()}
          </Link>
        </Button>
      </div>
    </main>
  );
}
