export const rpID =
  process.env.VERCEL_ENV === "production" ? "padelred.app" : "localhost";
export const rpOrigin =
  process.env.VERCEL_ENV === "production"
    ? "https://padelred.app"
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const rpName = "Padel Red";
