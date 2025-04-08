"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Users,
  ArrowRight,
  MoreHorizontal,
  Search,
  Download,
  Upload,
  Filter,
} from "lucide-react";
import { useTeam } from "@/app/providers/team-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMailingLists } from "@/app/providers/mailinglist-provider";
import {
  SheetDescription,
  SheetTitle,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetFooter,
} from "../ui/sheet";
import { Sheet } from "../ui/sheet";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "../page-header";
import { DataTable } from "../ui/data-table";
import { toast } from "sonner";

interface MailingList {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count?: {
    subscribers: number;
  };
}

export function ContactLists() {
  const [newList, setNewList] = useState({ name: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { team } = useTeam();
  const { lists, isLoading, error, refetch } = useMailingLists();

  const createList = async () => {
    try {
      const response = await fetch("/api/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newList, teamId: team?.id }),
      });

      if (!response.ok) throw new Error("Failed to create list");

      await refetch();
      setNewList({ name: "", description: "" });
      setIsDialogOpen(false);
      toast.success("Contact list created successfully");
    } catch (error) {
      toast.error("Failed to create contact list");
    }
  };

  const deleteList = async (id: string) => {
    try {
      const response = await fetch(
        `/api/mailing-list/${id}?teamId=${team?.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete list");

      await refetch();
      toast.success("Contact list deleted successfully");
    } catch (error) {
      toast.error("Failed to delete contact list");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Contact Lists"
        description="Manage your contact lists and their subscribers"
      >
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-200">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <SheetTrigger asChild>
              <Button className="text-white">
                <Plus className="h-4 w-4 mr-2" />
                New List
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[500px]">
              <SheetHeader className="space-y-4 pb-6 border-b">
                <SheetTitle className="text-2xl font-semibold text-[#241C15]">
                  Create New Contact List
                </SheetTitle>
                <SheetDescription className="text-base text-gray-600">
                  Create a new list to organize your contacts and manage your
                  audience more effectively.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium "
                  >
                    List Name
                  </label>
                  <Input
                    id="name"
                    value={newList.name}
                    onChange={(e) =>
                      setNewList({ ...newList, name: e.target.value })
                    }
                    placeholder="e.g., Newsletter Subscribers"
                    className="border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium "
                  >
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={newList.description}
                    onChange={(e) =>
                      setNewList({ ...newList, description: e.target.value })
                    }
                    placeholder="Add a description to help you remember what this list is for..."
                    className="min-h-[100px] border-gray-200"
                  />
                </div>
              </div>
              <SheetFooter className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                  className="border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createList}
                  disabled={isLoading}
                  className="bg-[#007C89] text-white hover:bg-[#005F6B]"
                >
                  Create List
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </PageHeader>
      {/* Table */}
      <div className="px-6">
        <DataTable
          data={lists}
          columns={[
            {
              header: "Name",
              accessorKey: "name",
            },
            {
              header: "Description",
              accessorKey: "description",
            },
            {
              header: "Contacts",
              accessorKey: "_count",
              cell: ({ row }: any) => row?.original?._count?.subscribers || 0,
            },
            {
              header: "Created Date",
              accessorKey: "createdAt",
              cell: ({ row }: any) =>
                format(row.original.createdAt, "MMM d, yyyy"),
            },
            {
              header: "Actions",
              accessorKey: "actions",
              cell: ({ row }: any) => (
                <Button
                  onClick={() => router.push(`/audience/lists/${row.original.id}`)}
                  variant="outline"
                >
                  View
                </Button>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
