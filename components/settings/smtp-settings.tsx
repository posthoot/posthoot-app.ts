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
import { useSMTP } from "@/app/providers/smtp-provider";
import { SMTPConfig, formSchema } from "@/lib/validations/smtp-provider";
import { SMTPProviders } from "./smtp-providers";
import { ApiError, SMTPProviderType } from "@/lib";
import Link from "next/link";
import { toast } from "sonner";

const DEFAULT_PROVIDERS: Record<SMTPProviderType, SMTPConfig> = {
  [SMTPProviderType.CUSTOM]: {
    provider: SMTPProviderType.CUSTOM,
    host: "",
    port: 587,
    username: "",
    password: "",
    requiresAuth: true,
    supportsTls: true,
    maxSendRate: 14,
    documentation: "",
  },
  [SMTPProviderType.GMAIL]: {
    provider: SMTPProviderType.GMAIL,
    host: "smtp.gmail.com",
    port: 587,
    username: "",
    password: "",
    requiresAuth: true,
    supportsTls: true,
    maxSendRate: 14,
    documentation: "https://support.google.com/mail/answer/7126229?hl=en",
  },
  [SMTPProviderType.OUTLOOK]: {
    provider: SMTPProviderType.OUTLOOK,
    host: "smtp.office365.com",
    port: 587,
    username: "",
    password: "",
    requiresAuth: true,
    supportsTls: true,
    maxSendRate: 14,
    documentation:
      "https://support.microsoft.com/en-us/office/set-up-a-connection-to-an-smtp-server-for-outlook-com-d088d509-d54c-4036-a5c3-21d483f2f017",
  },
  [SMTPProviderType.AMAZON]: {
    provider: SMTPProviderType.AMAZON,
    host: "email-smtp.us-east-1.amazonaws.com",
    port: 587,
    username: "",
    password: "",
    requiresAuth: true,
    supportsTls: true,
    maxSendRate: 14,
    documentation:
      "https://docs.aws.amazon.com/ses/latest/DeveloperGuide/smtp-connect.html",
  },
};

export function SMTPSettings({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}) {
  const [editConfig, setEditConfig] = useState<SMTPConfig | null>(null);
  const { team } = useTeam();
  const { configs: smtpConfigs, isLoading, refresh } = useSMTP();

  const form = useForm<SMTPConfig>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: null,
      provider: SMTPProviderType.CUSTOM,
      isActive: true,
      maxSendRate: 14,
    },
  });

  const onSubmit = async (data: SMTPConfig) => {
    try {
      // first test the configuration
      await testConfiguration(data);

      const response = await fetch(
        data.id ? `/api/smtp/${data.id}` : "/api/smtp",
        {
          method: data.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            smtpConfigs: [
              {
                ...data,
                port: Number(data.port),
                maxSendRate: Number(data.maxSendRate),
              },
            ],
            teamId: team.id,
          }),
        }
      );

      if (!response.ok) {
        const apiError = (await response.json()) as ApiError;
        throw new Error(apiError.message);
      }

      refresh();
      toast.success("SMTP configuration saved successfully");
      setIsDialogOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error("Failed to save SMTP configuration");
    }
  };

  const removeSMTPConfig = async (id: string) => {
    try {
      await fetch(`/api/smtp/${id}`, { method: "DELETE" });
      refresh();
      toast.success("SMTP configuration removed successfully");
    } catch (error) {
      toast.error("Failed to remove SMTP configuration");
    }
  };

  const testConfiguration = async (config: SMTPConfig) => {
    try {
      const response = await fetch(`/api/smtp/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          port: Number(config.port),
          maxSendRate: Number(config.maxSendRate),
        }),
      });

      if (!response.ok) {
        const apiError = (await response.json()) as ApiError;
        throw new Error(apiError.message);
      }

      toast.success("SMTP configuration test successful");
    } catch (error: any) {
      toast.error("SMTP configuration test failed");
      throw error;
    }
  };

  const onProviderChange = (value: SMTPProviderType) => {
    form.setValue("provider", value);
    if (value !== SMTPProviderType.CUSTOM) {
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
        <div className="flex flex-col gap-1.5">
          <Badge
            variant="secondary"
            className="w-max bg-violet-500/10 text-violet-500 font-medium capitalize"
          >
            {row.getValue("provider")}
          </Badge>
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
      accessorKey: "maxSendRate",
      header: "Send Rate",
      cell: ({ row }) => {
        const maxSendRate = row.getValue("maxSendRate") as string;
        return <Badge variant="secondary">{maxSendRate}/sec</Badge>;
      },
    },
    {
      accessorKey: "documentation",
      header: "Documentation",
      cell: ({ row }) => {
        const documentation = row.getValue("documentation") as string;
        return (
          <Link
            href={
              documentation ||
              DEFAULT_PROVIDERS[row.original.provider as SMTPProviderType]
                .documentation
            }
            className="text-sm  bg-muted-foreground/10 px-2 py-1 text-blue-500 hover:text-blue-600"
            target="_blank"
          >
            Read Docs
          </Link>
        );
      },
    },
    {
      accessorKey: "supportsTls",
      header: "TLS",
      cell: ({ row }) => {
        const supportsTLS = row.getValue("supportsTls") as boolean;
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
