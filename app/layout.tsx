import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { auth } from "@/auth";
import { NextAuthProvider } from "./providers/NextAuthProvider";
import { TeamProvider } from "@/app/providers/team-provider";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryProvider } from "./providers/query-provider";
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
    <SidebarProvider className="flex flex-col min-h-screen">
      <AppHeader heading="Posthoot ❇" className="shrink-0" />
      <div className="flex flex-col lg:flex-row flex-1 w-full bg-sidebar relative">
        <div className="lg:fixed lg:left-0 lg:top-[64px] lg:bottom-0 lg:w-64 overflow-y-auto overflow-x-hidden">
          <AppSidebar className="h-full w-full" />
        </div>
        <main className="flex-1 overflow-y-auto w-full lg:ml-64 max-h-svh">
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
          "antialiased bg-background text-foreground font-sentient text-base lg:text-lg"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
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
