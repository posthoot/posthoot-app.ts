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
  Eye,
  EyeOff,
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
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Sheet,
  SheetFooter,
} from "../ui/sheet";

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
          {provider.supportsTls && <Badge variant="secondary">TLS</Badge>}
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
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <SheetContent className="overflow-y-auto w-auto p-0">
        <SheetHeader className="p-4">
          <SheetTitle>Add SMTP Provider</SheetTitle>
          <SheetDescription>
            Add a new SMTP service provider configuration
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSaveProvider)}>
          <div className="p-4 space-y-4">
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
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                Need help? Check out our documentation.{" "}
                <a
                  href="https://docs.posthoot.com/docs/smtp-providers"
                  target="_blank"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Click here
                </a>
              </span>
            </div>
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Requires Authentication</Label>
                <p className="text-xs text-muted-foreground">
                  Provider requires username and password
                </p>
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
                <div className="space-y-2 relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    {...form.register("password")}
                  />
                  {!showPassword ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-6"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-6"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="noreply@example.com"
                {...form.register("fromEmail")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSendRate">Max Send Rate</Label>
              <Input
                id="maxSendRate"
                placeholder="1,000"
                type="number"
                {...form.register("maxSendRate")}
              />
              <p className="text-xs text-muted-foreground">
                This is the maximum number of emails that can be sent per
                second.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Supports TLS</Label>
                <p className="text-xs text-muted-foreground">
                  Provider supports TLS encryption
                </p>
              </div>
              <Switch
                checked={form.watch("supportsTls")}
                onCheckedChange={(checked) =>
                  form.setValue("supportsTls", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default Provider</Label>
                <p className="text-xs text-muted-foreground">
                  Make this the default provider
                </p>
              </div>
              <Switch
                checked={form.watch("isDefault")}
                onCheckedChange={(checked) =>
                  form.setValue("isDefault", checked)
                }
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Note: The default provider will be used for all email
              notifications.
            </span>
          </div>
          <SheetFooter className="flex justify-between sticky bottom-0 p-4 bg-background w-full">
            {/* <Button
              type="button"
              variant="outline"
              className="!text-sm"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button> */}
            {/* <div className="flex items-center space-x-2"> */}
            <Button
              type="button"
              variant="outline"
              className="!text-sm"
              onClick={() => onTestConnection(form.getValues())}
            >
              Test Connection
            </Button>
            <Button variant="default" type="submit" className="!text-sm">
              Save Provider
            </Button>
            {/* </div> */}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
