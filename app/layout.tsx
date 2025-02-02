import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { auth } from "@/auth";
import { NextAuthProvider } from "./providers/NextAuthProvider";
import { TeamProvider } from "@/app/providers/team-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "kori 🦆",
  description: "A powerful email automation and management platform",
  keywords: [
    "email",
    "automation",
    "email marketing",
    "email management",
    "email templates",
    "email campaigns",
  ],
  authors: [{ name: "Harsh Vardhan Goswami" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "kori 🦆",
    description: "A powerful email automation and management platform",
    siteName: "kori 🦆",
  },
};

// Move MainLayout to a client component file
async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex max-h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="flex flex-col min-h-screen">{children}</div>
      </main>
    </div>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          type="text/css"
          rel="stylesheet"
          href="https://ui8-simple-social.vercel.app/_next/static/css/a1fbed414a2f617b.css"
        />
      </head>
      <body
        className={cn(
          inter.className,
          "antialiased bg-background text-foreground"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <NextAuthProvider>
            <TeamProvider>
              <MainLayout>{children}</MainLayout>
            </TeamProvider>
          </NextAuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
