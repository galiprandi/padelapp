import { signIn } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import {
  getSignInFormAriaLabel,
  getSignInFormClasses,
  safeCallbackUrl,
} from "@/lib/auth-utils";

interface SignInFormProps {
  callbackUrl: string;
  label?: string;
  className?: string;
}

export function SignInForm({
  callbackUrl,
  label = "Continuar con Google",
  className,
}: SignInFormProps) {
  const safeCallback = safeCallbackUrl(callbackUrl);

  async function handleSignIn() {
    "use server";
    await signIn("google", { redirectTo: safeCallback });
  }

  return (
    <form
      action={handleSignIn}
      role="region"
      aria-label={getSignInFormAriaLabel()}
      className={getSignInFormClasses(className)}
    >
      <SignInButton label={label} className={className} />
    </form>
  );
}
