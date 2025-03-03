"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Users, ArrowRight, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useTeam } from "@/app/providers/team-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "../page-header";
import { useMailingLists } from "@/app/providers/mailinglist-provider";

interface MailingList {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export function ContactLists() {
  const [newList, setNewList] = useState({ name: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { team } = useTeam();
  const { 
    lists,
    isLoading,
    error,
    refetch
   } = useMailingLists();
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
    <div className="space-y-4">
      <PageHeader heading="Contact Lists" description="Manage your contact lists">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Contact List</DialogTitle>
              <DialogDescription>
                Create a new list to organize your contacts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={newList.name}
                  onChange={(e) =>
                    setNewList({ ...newList, name: e.target.value })
                  }
                  placeholder="Enter list name"
                />
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newList.description}
                  onChange={(e) =>
                    setNewList({ ...newList, description: e.target.value })
                  }
                  placeholder="Enter list description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={createList} disabled={isLoading}>
                Create List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="rounded-md border m-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lists.map((list) => (
              <TableRow key={list.id}>
                <TableCell className="font-medium">{list.name}</TableCell>
                <TableCell>{list.description}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {/* {list._count.subscribers} */}
                  </div>
                </TableCell>
                <TableCell>
                  {/* {format(new Date(list.createdAt), "MMM d, yyyy")} */}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/contacts/lists/${list.id}`)}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        View Contacts
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteList(list.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete List
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
