"use client";

import { logger } from "@/app/lib/logger";
import { Bell, HelpCircle, Plus, Search, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
  heading: string;
  description?: string;
  backButton?: {
    href: string;
    label: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export function AppHeader({
  heading,
  description,
  backButton,
  className,
  children,
}: AppHeaderProps) {
  const props = {
    heading,
    description,
    backButton,
  };

  logger.info({
    fileName: "page-header.tsx",
    action: "PageHeader",
    message: "props",
    emoji: "👋",
    value: props,
    label: "props",
  });

  return (
    <header className="sticky top-0 z-30 w-full border-b border bg-sidebar">
      <div className="flex h-16 items-center px-6">
        <img src="/assets/logo.svg" alt="Posthoot" className="h-10 w-10" />
        <div className="flex flex-1 items-center gap-x-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 bg-muted/40"
            />
          </div>
        </div>
        <div className="flex flex-none items-center gap-x-4">
          <Button
            variant="outline"
            className="rounded-full text-muted-foreground"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full text-muted-foreground"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback>MM</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export type { AppHeaderProps };
