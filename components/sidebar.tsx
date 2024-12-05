"use client";

import {
  Home,
  Users,
  Send,
  Zap,
  Settings,
  FileText,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { Logo } from "./logo";

const menuItems = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Contacts", icon: Users, href: "/contacts" },
  { name: "Campaigns", icon: Send, href: "/campaigns" },
  { name: "Templates", icon: FileText, href: "/templates" },
  { name: "Automations", icon: Zap, href: "/automations" },
  { name: "Team", icon: Users, href: "/team" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col bg-white h-screen justify-between">
      <div className="w-64 border-r">
        <div className="p-4 border-b">
          <Logo />
        </div>
        <nav className="p-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <Button
        className="m-3 flex border bg-red-100 text-red-500 items-center gap-2"
        variant="secondary"
        onClick={() => signOut()}
      >
        <span>Logout</span>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
