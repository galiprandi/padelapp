import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { auth, signIn } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { PasskeyLoginButton } from "@/components/webauthn/passkey-login-button";
import {
  getLoginContainerClasses,
  getLoginContentContainerClasses,
  getLoginFallbackContainerClasses,
  getLoginFallbackSpinnerClasses,
  getLoginFormContainerClasses,
  getLoginHeaderContainerClasses,
  getLoginHeaderTaglineClasses,
  getLoginHeaderTitleClasses,
  getLoginLoadingAriaLabel,
  getLoginLoadingText,
  getLoginLogoAltText,
  getLoginLogoClasses,
  getLoginRegionAriaLabel,
  getLoginTaglineText,
  getLoginTermsNoticeClasses,
  getLoginTermsNoticeText,
  getLoginTitleGroupClasses,
  getLoginTitleText,
  getSignInFormClasses,
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
        <div className={getLoginHeaderContainerClasses()}>
          <Image
            src="/icon.svg"
            alt={getLoginLogoAltText()}
            className={getLoginLogoClasses()}
            width={96}
            height={96}
            unoptimized
          />
          <div className={getLoginTitleGroupClasses()}>
            <h1 className={getLoginHeaderTitleClasses()}>
              {getLoginTitleText()}
            </h1>
            <p className={getLoginHeaderTaglineClasses()}>
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
              className={getLoginFallbackContainerClasses()}
            >
              <Loader2 className={getLoginFallbackSpinnerClasses()} aria-hidden="true" />
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
    <div className={getLoginFormContainerClasses()}>
      <form action={handleSignIn} className={getSignInFormClasses()}>
        <SignInButton />
      </form>
      <PasskeyLoginButton />
    </div>
  );
}
