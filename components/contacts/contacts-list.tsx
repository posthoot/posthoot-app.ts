"use client";

import { useState, useEffect } from "react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Mail, UserX, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/app/providers/team-provider";
import { ContactImport } from "./contact-import";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isDeleted: boolean;
  metadata: Record<string, any>;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
  listId: string;
  teamId: string;
  importId: string | null;
}

export function ContactsList({ listId }: { listId: string }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { team } = useTeam();

  const fetchContacts = async () => {
    if (!listId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/contacts?listId=${listId}&teamId=${team?.id}&page=${pagination.pageIndex}&limit=${pagination.pageSize}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      setContacts(data.data);
      setPagination({
        pageIndex: data.page,
        pageSize: data.limit,
      });
      setTotal(data.total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateContactStatus = async (contactId: string, newStatus: "ACTIVE" | "UNSUBSCRIBED") => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          teamId: team?.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to update contact status");

      toast({
        title: "Success",
        description: `Contact ${newStatus === "ACTIVE" ? "resubscribed" : "unsubscribed"} successfully`,
      });

      await fetchContacts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (team?.id && listId) {
      fetchContacts();
    }
  }, [team?.id, listId]);

  const columns: ColumnDef<Contact>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("email")}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.firstName && row.original.lastName 
              ? `${row.original.firstName} ${row.original.lastName}`
              : "No name"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge 
            variant={status === "ACTIVE" ? "default" : "outline"} 
            className="capitalize"
          >
            {status === "ACTIVE" ? "Subscribed" : "Unsubscribed"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {new Date(row.getValue("createdAt")).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground text-sm">
            {new Date(row.getValue("updatedAt")).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const contact = row.original;
        const isSubscribed = contact.isDeleted === false;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => updateContactStatus(
                  contact.id, 
                  isSubscribed ? "UNSUBSCRIBED" : "ACTIVE"
                )}
              >
                {isSubscribed ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Unsubscribe
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Resubscribe
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ContactImport listId={listId} onImportComplete={fetchContacts} />
      </div>

      <DataTable
        columns={columns}
        data={contacts}
        filterColumn="email"
      />
    </div>
  );
}
