import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FinanceFlow — Personal Finance with AI",
    template: "%s | FinanceFlow",
  },
  description:
    "Manage your finances without spreadsheets. AI categorizes, analyzes and generates insights automatically.",
  keywords: ["personal finance", "financial control", "AI", "budget", "investments", "finanças pessoais"],
  authors: [{ name: "FinanceFlow" }],
  creator: "FinanceFlow",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    alternateLocale: ["en_US"],
    title: "FinanceFlow — Personal Finance with AI",
    description: "Manage your finances without spreadsheets.",
    siteName: "FinanceFlow",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A1210" },
    { media: "(prefers-color-scheme: light)", color: "#FBF8F1" },
  ],
  width: "device-width",
  initialScale: 1,
};

import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <ThemeScript />
        <LocaleProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

/** Injeta o tema antes do primeiro paint para evitar flash. */
function ThemeScript() {
  const script = `
    (function(){
      try {
        var stored = localStorage.getItem('ff-theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = stored || (prefersDark ? 'dark' : 'light');
        if (theme === 'light') document.documentElement.classList.add('light');
      } catch(e){}
    })()
  `;
  // biome-ignore lint/security/noDangerouslySetInnerHtml: necessário para evitar FOUC
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
