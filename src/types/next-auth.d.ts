import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    displayName: string;
    alias?: string | null;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      displayName: string;
      alias?: string | null;
    };
  }
}
