import appSettings from "@/config/app-settings.json";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";
import { formatSpeculationRulesScript } from "@/lib/speculation-rules";
import {
  getResourceHints,
  getOriginTrialMetaProps,
  getResourceHintKey,
  formatResourceHintLinkProps,
} from "@/lib/resource-hints";
import {
  getRootBodyClasses,
  getRootHtmlAttributes,
} from "@/lib/root-layout-utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
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
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const resourceHints = getResourceHints();
  const originTrialMeta = getOriginTrialMetaProps(
    process.env.NEXT_PUBLIC_INSTALL_ORIGIN_TRIAL_TOKEN,
  );

  return (
    <html {...getRootHtmlAttributes()}>
      <head>
        {resourceHints.map((hint, idx) => (
          <link key={getResourceHintKey(hint, idx)} {...formatResourceHintLinkProps(hint)} />
        ))}
        {originTrialMeta && <meta {...originTrialMeta} />}
        <script {...formatSpeculationRulesScript()} />
      </head>
      <body className={getRootBodyClasses(geistSans.variable)}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
