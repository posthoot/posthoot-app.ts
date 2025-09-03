"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { Moon, Settings, Sun } from "lucide-react"
import Link from "next/link"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { data: session } = useSession();
  const { isMobile,open } = useSidebar()
  const { theme, setTheme } = useTheme();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="default"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${session?.user?.name}`} alt={session?.user?.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              {open && <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{session?.user?.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {session?.user?.email}
                </span>
              </div>}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${session?.user?.name}`} alt={session?.user?.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                {<div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{session?.user?.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {session?.user?.email}
                  </span>
                </div>}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            <DropdownMenuItem
                onClick={() => setTheme(theme == "light" ? "dark" : "light")}
              >
                {theme == "light" ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : (
                  <Sun className="mr-2 h-4 w-4" />
                )}
                {theme == "light" ? "Dark" : "Light"} mode
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={"/settings"} className="flex gap-x--2">
                <Settings className="mr-2 h-4 w-4" />
                Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
            <IconLogout />
                Log out
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
