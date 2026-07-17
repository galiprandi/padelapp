"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignInButtonProps {
  label?: string;
  className?: string;
}

export function SignInButton({
  label = "Continuar con Google",
  className = "h-12 w-full rounded-xl text-base font-semibold",
}: SignInButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={className}
      size="lg"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Conectando…
        </>
      ) : (
        label
      )}
    </Button>
  );
}
