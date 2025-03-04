"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/app/providers/team-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmailTemplate } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "draft" | "published";
  lastModified: string;
  teamId: string;
}

export function TemplatesList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 50,
  });

  const [totalCount, setTotalCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { team } = useTeam();

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/templates?page=${pagination.pageIndex}&limit=${pagination.pageSize}`
      );
      if (!response.ok) throw new Error("Failed to fetch templates");
      const data = await response.json();
      setTemplates(data.data);
      setTotalCount(data.total);
      setPagination({
        pageIndex: data.page,
        pageSize: data.limit,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { data, isLoading: isLoadingQuery } = useQuery({
    queryKey: ["templates", pagination.pageIndex, pagination.pageSize],
    queryFn: fetchTemplates,
  });

  const deleteTemplate = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/templates/${id}?teamId=${team?.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete template");

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      await fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const duplicateTemplate = async (data: EmailTemplate) => {
    try {
      setIsLoading(true);
      const createResponse = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          id: undefined,
          name: `${data.name} - Copy`,
          duplicate: true,
        }),
      });

      if (!createResponse.ok) throw new Error("Failed to duplicate template");

      toast({
        title: "Success",
        description: "Template duplicated successfully",
      });

      await fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (team?.id) {
      fetchTemplates();
    }
  }, [team?.id]);

  const columns: ColumnDef<EmailTemplate>[] = [
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.subject}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("category")?.["name"]}</div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {new Date(row.getValue("updatedAt")).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const template = row.original;

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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(template.id)}
              >
                Copy template ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/templates/${template.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateTemplate(template)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => deleteTemplate(template.id)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={templates as unknown as EmailTemplate[]}
      filterColumn="name"
      pagination={pagination}
      enablePagination={true}
      totalCount={totalCount}
      isLoading={isLoading}
      onPaginationChange={setPagination}
    />
  );
}
