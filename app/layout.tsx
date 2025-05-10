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
        <title>
          Posthoot: AI-Powered Email Marketing for Effortless Engagement
        </title>
        <meta
          name="description"
          content="Posthoot is the AI-powered email marketing platform that simplifies your workflow and boosts engagement. Create smarter campaigns and automate your marketing with AI. Start your free trial today!"
        />

        <meta property="og:url" content="https://posthoot.com" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Posthoot: AI-Powered Email Marketing for Effortless Engagement"
        />
        <meta
          property="og:description"
          content="Posthoot is the AI-powered email marketing platform that simplifies your workflow and boosts engagement. Create smarter campaigns and automate your marketing with AI. Start your free trial today!"
        />
        <meta
          property="og:image"
          content="https://framerusercontent.com/images/BIW4segud1fRHZGJB3wIGXKg9DQ.png"
        />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="posthoot.com" />
        <meta property="twitter:url" content="https://posthoot.com" />
        <meta
          name="twitter:title"
          content="Posthoot: AI-Powered Email Marketing for Effortless Engagement"
        />
        <meta
          name="twitter:description"
          content="Posthoot is the AI-powered email marketing platform that simplifies your workflow and boosts engagement. Create smarter campaigns and automate your marketing with AI. Start your free trial today!"
        />
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
        {/* publoic manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        {/* publoic icons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        {/* favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
        {/* theme color */}
        <meta name="theme-color" content="#0065FD" />
      </head>
      <body
        className={cn(
          "antialiased bg-background text-foreground font-sentient text-base lg:text-lg"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
        >
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
