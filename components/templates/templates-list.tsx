"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  Copy,
  Mail,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
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
import { Pagination } from "../ui/pagination";
import { Input } from "../ui/input";
import { toast } from "sonner";

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
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 50,
  });

  const [totalCount, setTotalCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
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
      toast.error("Failed to fetch templates");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/templates/${id}?teamId=${team?.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete template");

      toast.success("Template deleted successfully");

      await fetchTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
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

      toast.success("Template duplicated successfully");

      await fetchTemplates();
    } catch (error) {
      toast.error("Failed to duplicate template");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (team?.id) {
      fetchTemplates();
    }
  }, [team?.id]);

  return (
    <div className="space-y-4 pb-12">
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin  h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : templates?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground">No templates found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates?.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-4 border border-muted rounded-lg"
            >
              <div className="flex items-center gap-4">
                <img
                  src="/assets/pixeltrue-icons-browser-window-with-website-code-and-paint-roller.png"
                  className="h-16"
                />
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last updated{" "}
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
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
                    onClick={() => {
                      navigator.clipboard.writeText(template.id);
                      toast.success("Template ID copied to clipboard");
                    }}
                  >
                    Copy template ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/templates/${template.id}/edit`)
                    }
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
            </div>
          ))}

          {pagination && (
            <div className="flex justify-between items-center mt-4 text-sm text-[#606060]">
              <div>
                Showing results {pagination.pageIndex} - {" "}
                {pagination.pageIndex * pagination.pageSize} of {totalCount}
              </div>
              <div className="flex items-center gap-2">
                <span>Page</span>
                <Input
                  className="w-12 h-8 text-center rounded-sm"
                  value={pagination.pageIndex}
                  readOnly
                />
                <span>of {Math.ceil(totalCount / pagination.pageSize)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#403F3F]"
                  onClick={() => {
                    setPagination({
                      pageIndex: pagination.pageIndex - 1,
                      pageSize: pagination.pageSize,
                    });
                  }}
                  disabled={pagination.pageIndex === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#403F3F]"
                  onClick={() => {
                    setPagination({
                      pageIndex: pagination.pageIndex + 1,
                      pageSize: pagination.pageSize,
                    });
                  }}
                  disabled={pagination.pageIndex === totalCount}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
