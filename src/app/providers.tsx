"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";
import { ToastProvider } from "@/components/toast/toast-provider";
import { PwaRegistrar } from "@/components/pwa/pwa-registrar";
import { createAppQueryClient } from "@/lib/query-client-config";
import {
  getProvidersContainerClasses,
  getProvidersRegionAriaAttributes,
  getSessionProviderProps,
  getProvidersToastProviderProps,
  isPwaRegistrarEnabled,
} from "@/lib/providers-utils";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createAppQueryClient());
  const sessionProps = getSessionProviderProps();
  const toastProps = getProvidersToastProviderProps();

  return (
    <div
      className={getProvidersContainerClasses()}
      {...getProvidersRegionAriaAttributes()}
    >
      <SessionProvider {...sessionProps}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider {...toastProps}>
            {isPwaRegistrarEnabled(process.env.NEXT_PUBLIC_DISABLE_PWA) && (
              <PwaRegistrar />
            )}
            {children}
          </ToastProvider>
        </QueryClientProvider>
      </SessionProvider>
    </div>
  );
}
