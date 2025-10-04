import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    displayName: string;
    level: number;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      displayName: string;
      level: number;
    };
  }
}
