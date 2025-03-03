"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { useTeam } from "@/app/providers/team-provider";
import { useSMTP } from "@/app/providers/smtp-provider";
import { SMTPConfig, formSchema } from "@/lib/validations/smtp-provider";
import { SMTPProviders } from "./smtp-providers";
import { SMTPProvider } from "@/types";
import Link from "next/link";
const DEFAULT_PROVIDER = SMTPProvider.CUSTOM;
const DEFAULT_PROVIDERS: Record<SMTPProvider, SMTPConfig> = {
  [SMTPProvider.CUSTOM]: {
    provider: SMTPProvider.CUSTOM,
    host: "",
    port: "",
    username: "",
    password: "",
    requiresAuth: true,
    supportsTLS: true,
    maxSendRate: "1000",
    documentation: "",
  },
  [SMTPProvider.GMAIL]: {
    provider: SMTPProvider.GMAIL,
    host: "smtp.gmail.com",
    port: "587",
    username: "",
    password: "",
    requiresAuth: true,
    supportsTLS: true,
    maxSendRate: "1000",
    documentation: "https://support.google.com/mail/answer/7126229?hl=en",
  },
  [SMTPProvider.OUTLOOK]: {
    provider: SMTPProvider.OUTLOOK,
    host: "smtp.office365.com",
    port: "587",
    username: "",
    password: "",
    requiresAuth: true,
    supportsTLS: true,
    maxSendRate: "1000",
    documentation: "https://support.microsoft.com/en-us/office/set-up-a-connection-to-an-smtp-server-for-outlook-com-d088d509-d54c-4036-a5c3-21d483f2f017",
  },
  [SMTPProvider.AMAZON]: {
    provider: SMTPProvider.AMAZON,
    host: "email-smtp.us-east-1.amazonaws.com",
    port: "587",
    username: "",
    password: "",
    requiresAuth: true,
    supportsTLS: true,
    maxSendRate: "1000",
    documentation: "https://docs.aws.amazon.com/ses/latest/DeveloperGuide/smtp-connect.html",
  },
};

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
    form.reset({ provider: SMTPProvider.CUSTOM, isActive: true });
    setIsDialogOpen(true);
  };

  const form = useForm<SMTPConfig>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: SMTPProvider.CUSTOM,
      isActive: true,
    },
  });

  const onSubmit = async (data: SMTPConfig) => {
    try {
      console.log(data, team.id, "team id");
      // const response = await fetch("/api/smtp", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ smtpConfigs: [data], teamId: team.id }),
      // });

      // if (!response.ok) throw new Error("Failed to save configuration");
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

  const onProviderChange = (value: SMTPProvider) => {
    form.setValue("provider", value);
    if (value !== SMTPProvider.CUSTOM) {
      const provider = DEFAULT_PROVIDERS[value];
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
      accessorKey: "maxSendRate",
      header: "Send Rate",
    },
    {
      accessorKey: "documentation",
      header: "Documentation",
      cell: ({ row }) => {
        const documentation = row.getValue("documentation") as string;
        return (
          <Link href={documentation} target="_blank">
            Documentation
          </Link>
        );
      },
    },
    {
      accessorKey: "supportsTLS",
      header: "TLS",
      cell: ({ row }) => {
        const supportsTLS = row.getValue("supportsTLS") as boolean;
        return (
          <Badge variant={supportsTLS ? "success" : "secondary"}>
            {supportsTLS ? "Yes" : "No"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "requiresAuth",
      header: "Requires Auth",
      cell: ({ row }) => {
        const requiresAuth = row.getValue("requiresAuth") as boolean;
        return (
          <Badge variant={requiresAuth ? "success" : "secondary"}>
            {requiresAuth ? "Yes" : "No"}
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

      <SMTPProviders
        onTestConnection={testConfiguration}
        onSaveProvider={onSubmit}
        isDialogOpen={isDialogOpen}
        form={form}
        onProviderChange={onProviderChange}
        providers={DEFAULT_PROVIDERS}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  );
}
