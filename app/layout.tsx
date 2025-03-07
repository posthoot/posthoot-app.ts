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
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryProvider } from "./providers/query-provider";

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
    <SidebarProvider>
      <div className="flex max-h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 h-screen overflow-y-auto w-full">
          <div className="flex flex-col min-h-screen">{children}</div>
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
      </head>
      <body
        className={cn(
          "antialiased bg-background text-foreground font-sentient"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
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
