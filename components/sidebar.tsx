"use client";

import {
  Home,
  Users,
  Send,
  Zap,
  Settings,
  FileText,
  LogOut,
  Key,
  ChevronLeft,
  ChevronRight,
  Mail,
  Ship,
  ShipWheel,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Logo } from "./logo";

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    label: "Contacts",
    icon: Users,
    href: "/contacts/lists",
  },
  {
    label: "Campaigns",
    icon: Send,
    href: "/campaigns",
  },
  {
    label: "Templates",
    icon: FileText,
    href: "/templates",
  },
  {
    label: "Automations",
    icon: Zap,
    href: "/automations",
  },
  {
    label: "Team",
    icon: Users,
    href: "/team",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    label: "SMTP",
    icon: Mail,
    href: "/settings/smtp",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col h-screen justify-between border-r transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div>
        <div className="p-4 border-b flex items-center justify-between">
          <div
            className={cn(
              "transition-all duration-300",
            )}
          >
            {!isCollapsed && <Logo />}
            {isCollapsed && <ShipWheel className="h-6 w-6" />}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="p-2 space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isCollapsed && "justify-center px-2",
                pathname === route.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <route.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{route.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
      <Button
        className={cn(
          "m-3 flex items-center gap-2",
          isCollapsed ? "px-2 justify-center" : "px-4"
        )}
        variant="outline"
        onClick={() => signOut()}
      >
        {!isCollapsed && <span>Logout</span>}
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
