"use client";

import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  TestTube,
  Settings,
  Link,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { formSchema, SMTPConfig } from "@/lib/validations/smtp-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SMTPProvider } from "@/types";

export const columns: ColumnDef<SMTPConfig>[] = [
  {
    accessorKey: "name",
    header: "Provider",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("name")}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.host}:{row.original.port}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "maxSendRate",
    header: "Send Rate",
  },
  {
    id: "security",
    header: "Security",
    cell: ({ row }) => {
      const provider = row.original;
      return (
        <div className="flex gap-2">
          {provider.requiresAuth && (
            <Badge variant="secondary">Auth Required</Badge>
          )}
          {provider.supportsTLS && <Badge variant="secondary">TLS</Badge>}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={status === "active" ? "success" : "secondary"}
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const provider = row.original;

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
              onClick={() => window.open(provider.documentation, "_blank")}
            >
              <Link className="mr-2 h-4 w-4" />
              Documentation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function SMTPProviders({
  onTestConnection,
  onSaveProvider,
  isDialogOpen,
  setIsDialogOpen,
  form,
  providers,
  onProviderChange,
}: {
  onTestConnection: (data: z.infer<typeof formSchema>) => void;
  onSaveProvider: (data: z.infer<typeof formSchema>) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  providers: Record<SMTPProvider, SMTPConfig>;
  onProviderChange: (provider: SMTPProvider) => void;
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add SMTP Provider</DialogTitle>
          <DialogDescription>
            Add a new SMTP service provider configuration
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSaveProvider)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="provider">Provider Type</Label>
            <Select
              onValueChange={(value) => {
                const provider = providers[value as SMTPProvider];
                onProviderChange(provider.provider as SMTPProvider);
              }}
              defaultValue={Object.keys(providers)[0]}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(providers).map(([provider, config]) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                placeholder="587"
                {...form.register("port")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxSendRate">Max Send Rate</Label>
            <Input
              id="maxSendRate"
              placeholder="1,000/day"
              {...form.register("maxSendRate")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentation">Documentation URL</Label>
            <Input
              id="documentation"
              type="url"
              key={form.getValues("provider")}
              defaultValue={
                providers[form.getValues("provider")].documentation
              }
              placeholder="https://example.com/docs"
              {...form.register("documentation")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Requires Authentication</Label>
              <div className="text-sm text-muted-foreground">
                Provider requires username and password
              </div>
            </div>
            <Switch
              checked={form.watch("requiresAuth")}
              onCheckedChange={(checked) =>
                form.setValue("requiresAuth", checked)
              }
            />
          </div>
          {form.watch("requiresAuth") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="john@example.com"
                  {...form.register("username")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  {...form.register("password")}
                />
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Supports TLS</Label>
              <div className="text-sm text-muted-foreground">
                Provider supports TLS encryption
              </div>
            </div>
            <Switch
              checked={form.watch("supportsTLS")}
              onCheckedChange={(checked) =>
                form.setValue("supportsTLS", checked)
              }
            />
          </div>
          <div className="flex justify-between items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onTestConnection(form.getValues())}
              >
                Test Connection
              </Button>
              <Button variant="default" type="submit">
                Save Provider
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
