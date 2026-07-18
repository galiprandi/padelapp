import { signIn } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";

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
  async function handleSignIn() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  return (
    <form action={handleSignIn}>
      <SignInButton label={label} className={className} />
    </form>
  );
}
