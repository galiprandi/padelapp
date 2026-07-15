import appSettings from "@/config/app-settings.json";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appSettings.baseUrl),
  title: {
    default: appSettings.name,
    template: appSettings.titleTemplate,
  },
  description: appSettings.description,
  applicationName: appSettings.applicationName,
  manifest: appSettings.manifestPath,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [
      { url: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
    shortcut: ["/icon.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: appSettings.appleWebAppTitle,
  },
  category: appSettings.category,
  keywords: appSettings.keywords,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {process.env.NEXT_PUBLIC_INSTALL_ORIGIN_TRIAL_TOKEN && (
          <meta
            http-equiv="origin-trial"
            content={process.env.NEXT_PUBLIC_INSTALL_ORIGIN_TRIAL_TOKEN}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
