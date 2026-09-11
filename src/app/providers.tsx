"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";
import { ToastProvider } from "@/components/toast/toast-provider";
import { PwaRegistrar } from "@/components/pwa/pwa-registrar";
import { createAppQueryClient } from "@/lib/query-client-config";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createAppQueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <PwaRegistrar />
          {children}
        </ToastProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
