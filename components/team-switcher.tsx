"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronDownIcon, PlusIcon } from "@radix-ui/react-icons"
import Image from "next/image"
export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0])
  const {open}=useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
            {/* <SidebarMenuButton className="w-fit px-1.5"> */}
              <div className="flex  items-center gap-x-4  rounded-md">
                <Image
                alt="Logo"
                height={40}
                width={40}
                src={"https://framerusercontent.com/images/Mj9OOgqyJTaP8t5wDmlauyecVM.png?scale-down-to=512"}
                />
              {open && <span className="truncate font-semibold">{activeTeam.name}</span>}
              </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
