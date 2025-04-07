"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
import { DataTable } from "../table/data-table";

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
  const { toast } = useToast();
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
      toast({
        title: "Success",
        description: "Contact list created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create contact list",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Contact list deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact list",
        variant: "destructive",
      });
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
                    className="text-sm font-medium text-gray-900"
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
                    className="text-sm font-medium text-gray-900"
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
      {/* Header Actions */}
      <div className="flex px-6 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search lists..."
              className="pl-9 w-[300px] border-gray-200"
            />
          </div>
          <Button variant="outline" size="icon" className="border-gray-200">
            <Filter className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Lists Table */}
      <Table className="mx-6">
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-medium text-gray-600">Name</TableHead>
            <TableHead className="font-medium text-gray-600">
              Description
            </TableHead>
            <TableHead className="font-medium text-gray-600">
              Contacts
            </TableHead>
            <TableHead className="font-medium text-gray-600">Created</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lists.map((list) => (
            <TableRow
              key={list.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => router.push(`/audience/lists/${list.id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rotate-180 flex items-center justify-center">
                    <img
                      src={`https://ouch-cdn2.icons8.com/UNXKLVqUs08O7aegqb3wS7OfVCjzXHopCRDig6wRPDo/rs:fit:1103:456/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNjkz/L2U1NjM4NTAwLTdh/YjgtNGVjYy04YTU0/LTFmYjlkYmZkOTBm/Mi5zdmc.png`}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{list.name}</div>
                    <div className="text-sm text-gray-500">
                      {list._count?.subscribers || 0} subscribers
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                {list.description || "No description"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-[#007C89]/5 text-[#007C89] border-[#007C89]/20"
                  >
                    {list._count?.subscribers || 0} contacts
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                {format(new Date(list.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                
              </TableCell>
            </TableRow>
          ))}
          {lists.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Users className="h-8 w-8 mb-2 text-gray-400" />
                  <p className="text-sm">No contact lists yet</p>
                  <p className="text-sm text-gray-400">
                    Create your first list to start organizing your contacts
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
