import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { auth, signIn } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { PasskeyLoginButton } from "@/components/webauthn/passkey-login-button";
import {
  getLoginContainerClasses,
  getLoginContentContainerClasses,
  getLoginLoadingAriaLabel,
  getLoginLoadingText,
  getLoginLogoAltText,
  getLoginRegionAriaLabel,
  getLoginTaglineText,
  getLoginTermsNoticeClasses,
  getLoginTermsNoticeText,
  getLoginTitleText,
  safeCallbackUrl,
} from "@/lib/auth-utils";
import Image from "next/image";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className={getLoginContainerClasses()}>
      <section
        role="region"
        aria-label={getLoginRegionAriaLabel()}
        className={getLoginContentContainerClasses()}
      >
        {/* Logo + tagline */}
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/icon.svg"
            alt={getLoginLogoAltText()}
            className="h-24 w-24"
            width={96}
            height={96}
            unoptimized
          />
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold text-foreground">
              {getLoginTitleText()}
            </h1>
            <p className="text-sm text-muted-foreground max-w-[240px] whitespace-pre-line">
              {getLoginTaglineText()}
            </p>
          </div>
        </div>

        {/* CTA wrapped in Suspense */}
        <Suspense
          fallback={
            <div
              role="status"
              aria-label={getLoginLoadingAriaLabel()}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-muted text-muted-foreground text-sm font-semibold"
            >
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" aria-hidden="true" />
              {getLoginLoadingText()}
            </div>
          }
        >
          <LoginForm searchParams={searchParams} />
        </Suspense>

        <p className={getLoginTermsNoticeClasses()}>
          {getLoginTermsNoticeText()}
        </p>
      </section>
    </main>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [session, resolvedParams] = await Promise.all([
    auth(),
    searchParams,
  ]);
  const callbackUrl = resolvedParams.callbackUrl;
  const safeCallback = safeCallbackUrl(callbackUrl);

  if (session?.user) {
    redirect(safeCallback);
  }

  async function handleSignIn() {
    "use server";
    const resolved = await searchParams;
    await signIn("google", {
      redirectTo: safeCallbackUrl(resolved.callbackUrl),
    });
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <form action={handleSignIn} className="w-full">
        <SignInButton />
      </form>
      <PasskeyLoginButton />
    </div>
  );
}
