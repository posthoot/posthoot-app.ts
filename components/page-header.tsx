"use client";

import { logger } from "@/app/lib/logger";
import { ChevronLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { auth } from "@/auth";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface PageHeaderProps {
  heading: string;
  description?: string;
  backButton?: {
    href: string;
    label: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  heading,
  description,
  backButton,
  className,
  children,
}: PageHeaderProps) {
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

  const session = useSession();

  return (
    <div
      className={cn(
        "sticky top-0 z-10 backdrop-blur",
        "border-b py-4 px-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {backButton && (
            <Link
              href={backButton.href}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {backButton.label}
            </Link>
          )}{" "}
          {children}
          <DropdownMenu>
            <DropdownMenuTrigger className="ml-2">
              <Avatar>
                <AvatarImage src={session?.data?.user?.image ?? ""} />
                <AvatarFallback>
                  {session?.data?.user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <span>Account</span>
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="text-red-400"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export type { PageHeaderProps };
