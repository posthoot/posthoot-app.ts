"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash, TestTube } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTeam } from "@/app/providers/team-provider";
import { toast } from "sonner";
import { useIMAP } from "@/app/providers/imap-provider";
import { IMAPConfig, IMAPConfigSchema } from "@/lib/validations/imap-provider";
import { ApiError } from "@/lib";
import { IMAPProviders } from "./imap-providers";

export function IMAPSettings({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}) {
  const [editConfig, setEditConfig] = useState<IMAPConfig | null>(null);
  const { team } = useTeam();
  const { configs: imapConfigs, isLoading, refresh } = useIMAP();

  const form = useForm<IMAPConfig>({
    resolver: zodResolver(IMAPConfigSchema),
    defaultValues: {
      id: null,
      host: "",
      port: 993,
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: IMAPConfig) => {
    try {
      // first test the configuration
      await testConfiguration(data);

      const response = await fetch(data.id ? `/api/imap` : "/api/imap", {
        method: data.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imapConfigs: [
            {
              ...data,
              port: Number(data.port),
            },
          ],
          teamId: team.id,
        }),
      });

      if (!response.ok) {
        const apiError = (await response.json()) as ApiError;
        throw new Error(apiError.message);
      }

      refresh();
      toast.success("IMAP configuration saved successfully");
      setIsDialogOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error("Failed to save IMAP configuration");
    }
  };

  const removeSMTPConfig = async (id: string) => {
    try {
      await fetch(`/api/imap/${id}`, { method: "DELETE" });
      refresh();
      toast.success("IMAP configuration removed successfully");
    } catch (error) {
      toast.error("Failed to remove IMAP configuration");
    }
  };

  const testConfiguration = async (config: IMAPConfig) => {
    try {
      const response = await fetch(`/api/imap/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          port: Number(config.port),
        }),
      });

      if (!response.ok) {
        const apiError = (await response.json()) as ApiError;
        throw new Error(apiError.message);
      }

      toast.success("IMAP configuration test successful");
    } catch (error: any) {
      toast.error("IMAP configuration test failed");
      throw error;
    }
  };

  useEffect(() => {
    if (editConfig) {
      form.reset(editConfig);
      setIsDialogOpen(true);
    }
  }, [editConfig, form]);

  const columns: ColumnDef<IMAPConfig>[] = [
    {
      accessorKey: "host",
      header: "Host",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5">
          <Badge variant="outline" className="text-sm w-max">
            {row.original.port
              ? `${row.original.host}:${row.original.port}`
              : row.original.host}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => {
        const username = row.getValue("username") as string;
        return (
          <Badge variant="secondary">
            {username.slice(0, 5)}...{username.slice(-5)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge
            variant={isActive ? "success" : "secondary"}
            className="capitalize"
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const config = row.original;

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
              <DropdownMenuItem onClick={() => testConfiguration(config)}>
                <TestTube className="mr-2 h-4 w-4" />
                Test Connection
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditConfig(config)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => removeSMTPConfig(config.id as string)}
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
    <div className="space-y-6">
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={imapConfigs}
        filterColumn="host"
      />

      <IMAPProviders
        onTestConnection={testConfiguration}
        onSaveProvider={onSubmit}
        isDialogOpen={isDialogOpen}
        form={form}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  );
}
