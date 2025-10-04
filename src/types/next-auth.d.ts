import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    alias: string;
    level: number;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      alias: string;
      level: number;
    };
  }
}
