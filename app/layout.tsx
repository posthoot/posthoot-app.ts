import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { logger } from "@/app/lib/logger";
import { auth } from "@/auth";
import { NextAuthProvider } from "./providers/NextAuthProvider";
import { TeamProvider } from "@/app/providers/team-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SailMail",
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
    title: "SailMail",
    description: "A powerful email automation and management platform",
    siteName: "SailMail",
  },
};

// Move MainLayout to a client component file
async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  logger.info({
    fileName: "layout.tsx",
    action: "MainLayout",
    message: "MainLayout",
    emoji: "🏠",
    label: "MainLayout",
    value: session,
  });

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        inter.className,
        "antialiased bg-background text-foreground"
      )}>
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
