"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Download, Plus } from "lucide-react";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  const siteHeadingData = [
    {
      pageTitle: "Analytics",
      pageDescription: "Your email campaign performance metrics",
      button1Title: "Download Report",
      button2Title: "Create Campaign",
      button1icon: <Download size={14} />,
      button2icon: <Plus size={14} />,
      pageUrl: "/",
    },
    {
      pageTitle: "Inbox",
      pageDescription: "Overview of your activities",
      pageUrl: "/inbox",
    },
    {
      pageTitle: "Outbox",
      pageDescription: "Manage your account preferences",
      pageUrl: "/developer/logs/emails",
    },
    {
      pageTitle: "All campaigns",
      pageDescription: "Manage your campaigns here",
      button2Title: "Create Campaign",
      button2icon: <Plus size={14} />,
      pageUrl: "/campaigns",
    },
    {
      pageTitle: "Templates",
      pageDescription: "Manage your email templates and preview the result",
      button2Title: "Create Campaign",
      button2icon: <Plus size={14} />,
      pageUrl: "/templates",
    },
    {
      pageTitle: "Automations - Overview",
      pageDescription: "Manage your email automations and preview the result",
      button2Title: "Create Automation",
      button2icon: <Plus size={14} />,
      pageUrl: "/automations",
    },
    {
      pageTitle: "Outbox",
      pageDescription: "Manage your account preferences",
      button1Title: "Save Settings",
      button2Title: "Reset Defaults",
      button1icon: <Download size={14} />,
      button2icon: <Plus size={14} />,
      pageUrl: "/developer/logs/emails",
    },
  ];

  // Match current route
  const currentPage = siteHeadingData.find((item) => item.pageUrl === pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {currentPage && (
          <div className="flex w-full justify-between items-center">
            {/* Page title + description */}
            <div>
              <div className="text-lg font-semibold text-[#171717]">
                {currentPage.pageTitle && currentPage.pageTitle}
              </div>
              <div className="text-base font-medium text-[#737373]">
                {currentPage.pageDescription && currentPage.pageDescription}
              </div>
            </div>

            {/* Action buttons */}
            <div className="ml-auto flex items-center gap-2">
              {currentPage.button1icon && currentPage.button1Title && (
                <Button
                  variant="outline"
                  asChild
                  size="sm"
                  className="hidden sm:flex"
                >
                  <a
                    href="#"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="dark:text-foreground flex items-center gap-1"
                  >
                    {currentPage.button1icon}
                    {currentPage.button1Title}
                  </a>
                </Button>
              )}
              {currentPage.button2icon && currentPage.button2Title && (
                <Button
                  variant="default"
                  asChild
                  size="sm"
                  className="hidden sm:flex"
                >
                  <a
                    href="#"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="dark:text-foreground flex items-center gap-1"
                  >
                    {currentPage.button2icon}
                    {currentPage.button2Title}
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
