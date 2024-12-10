"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeam } from "@/app/providers/team-provider";
import { useSMTP } from "@/app/providers/smtp-provider";
import { SMTPConfig, formSchema } from "@/lib/validations/smtp-provider";

const SMTP_PROVIDERS = {
  gmail: {
    host: "smtp.gmail.com",
    port: "587",
  },
  outlook: {
    host: "smtp.office365.com",
    port: "587",
  },
  amazon: {
    host: "email-smtp.us-east-1.amazonaws.com",
    port: "587",
  },
  custom: {
    host: "",
    port: "",
  },
} as const;



export function SMTPSettings({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [editConfig, setEditConfig] = useState<SMTPConfig | null>(null);
  const { team } = useTeam();
  const {
    configs: smtpConfigs,
    isLoading,
    error,
    updateConfig,
    refresh,
  } = useSMTP();

  const openCreateSMTPDialog = () => {
    setEditConfig(null);
    form.reset({ provider: "custom", isActive: true });
    setIsDialogOpen(true);
  };

  const form = useForm<SMTPConfig>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: "custom",
      isActive: true,
    },
  });

  const onSubmit = async (data: SMTPConfig) => {
    try {
      const response = await fetch("/api/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smtpConfig: data, teamId: team.id }),
      });

      if (!response.ok) throw new Error("Failed to save configuration");
      refresh();
      toast({
        title: "Success",
        description: "SMTP configuration saved successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SMTP configuration",
        variant: "destructive",
      });
    }
  };

  const removeSMTPConfig = async (id: string) => {
    try {
      await fetch(`/api/smtp/${id}`, { method: "DELETE" });
      refresh();
      toast({
        title: "Success",
        description: "SMTP configuration removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove SMTP configuration",
        variant: "destructive",
      });
    }
  };

  const testConfiguration = async (config: SMTPConfig) => {
    try {
      const response = await fetch(`/api/smtp/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error("Test failed");

      toast({
        title: "Success",
        description: "SMTP configuration test successful",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "SMTP configuration test failed",
        variant: "destructive",
      });
    }
  };

  const onProviderChange = (value: string) => {
    form.setValue("provider", value);
    if (value !== "custom") {
      const provider = SMTP_PROVIDERS[value as keyof typeof SMTP_PROVIDERS];
      form.setValue("host", provider.host);
      form.setValue("port", provider.port);
    }
  };

  useEffect(() => {
    if (editConfig) {
      form.reset(editConfig);
      setIsDialogOpen(true);
    }
  }, [editConfig, form]);

  const columns: ColumnDef<SMTPConfig>[] = [
    {
      accessorKey: "provider",
      header: "Provider",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium capitalize">
            {row.getValue("provider")}
          </span>
          <span className="text-sm text-muted-foreground">
            {row.original.host}:{row.original.port}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: "Username",
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
                onClick={() => removeSMTPConfig(config.id!)}
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
        data={smtpConfigs}
        filterColumn="provider"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editConfig ? "Edit" : "Add"} SMTP Server</DialogTitle>
            <DialogDescription>
              Configure your SMTP server settings for sending emails
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={form.watch("provider")}
                onValueChange={onProviderChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom SMTP</SelectItem>
                  <SelectItem value="gmail">Gmail SMTP</SelectItem>
                  <SelectItem value="outlook">Outlook SMTP</SelectItem>
                  <SelectItem value="amazon">Amazon SES</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  placeholder="smtp.example.com"
                  {...form.register("host")}
                  disabled={form.watch("provider") !== "custom"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder="587"
                  {...form.register("port")}
                  disabled={form.watch("provider") !== "custom"}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="email"
                placeholder="smtp@example.com"
                {...form.register("username")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditConfig(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
