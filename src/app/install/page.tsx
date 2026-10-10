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
} from "@/components/share/install-utils";
import Image from "next/image";

export default function InstallPage() {
  return (
    <main
      role="region"
      aria-label={getInstallPageAriaLabel()}
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {/* Logo */}
        <Image
          src="/icon.svg"
          alt={getInstallPageLogoAltText()}
          className="h-20 w-20"
          width={80}
          height={80}
          unoptimized
        />

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {getInstallPageTitle()}
          </h1>
          <p className="text-sm text-muted-foreground max-w-[260px]">
            {getInstallPageDescription()}
          </p>
        </div>

        <div className="w-full">
          <InstallContent />
        </div>

        <Button
          variant="ghost"
          className={getInstallPageBackLinkClasses()}
          asChild
        >
          <Link href="/" prefetch={true} aria-label={getInstallPageBackAriaLabel()}>
            Volver al inicio
          </Link>
        </Button>
      </div>
    </main>
  );
}
