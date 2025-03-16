import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { auth } from "@/auth";
import { NextAuthProvider } from "./providers/NextAuthProvider";
import { TeamProvider } from "@/app/providers/team-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryProvider } from "./providers/query-provider";
import { PageHeader } from "@/components/page-header";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "Posthoot ❇",
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
    title: "Posthoot ❇",
    description: "A powerful email automation and management platform",
    siteName: "Posthoot ❇",
  },
};

// Move MainLayout to a client component file
async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider className="flex flex-col h-screen max-h-screen">
      <AppHeader heading="Posthoot ❇" />
      <div className="flex h-full w-full overflow-hidden bg-sidebar">
        <AppSidebar />
        <main className="flex-1 h-full overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </SidebarProvider>
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
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=sentient@400&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body
        className={cn(
          "antialiased bg-background text-foreground font-sentient"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <NextAuthProvider>
            <QueryProvider>
              <TeamProvider>
                <MainLayout>{children}</MainLayout>
              </TeamProvider>
            </QueryProvider>
          </NextAuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
