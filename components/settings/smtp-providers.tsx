"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash, TestTube, Settings, Link } from "lucide-react";
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

interface SMTPProvider {
  id: string;
  name: string;
  host: string;
  port: number;
  requiresAuth: boolean;
  supportsTLS: boolean;
  maxSendRate: string;
  status: "active" | "inactive";
  documentation: string;
}

const providers: SMTPProvider[] = [
  {
    id: "1",
    name: "Gmail SMTP",
    host: "smtp.gmail.com",
    port: 587,
    requiresAuth: true,
    supportsTLS: true,
    maxSendRate: "2,000/day",
    status: "active",
    documentation: "https://support.google.com/mail/answer/7126229",
  },
  {
    id: "2",
    name: "Amazon SES",
    host: "email-smtp.us-east-1.amazonaws.com",
    port: 587,
    requiresAuth: true,
    supportsTLS: true,
    maxSendRate: "50,000/day",
    status: "active",
    documentation: "https://docs.aws.amazon.com/ses/latest/dg/smtp-connect.html",
  },
  {
    id: "3",
    name: "SendGrid",
    host: "smtp.sendgrid.net",
    port: 587,
    requiresAuth: true,
    supportsTLS: true,
    maxSendRate: "100,000/day",
    status: "active",
    documentation: "https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp",
  },
  {
    id: "4",
    name: "Mailgun",
    host: "smtp.mailgun.org",
    port: 587,
    requiresAuth: true,
    supportsTLS: true,
    maxSendRate: "Varies by plan",
    status: "inactive",
    documentation: "https://documentation.mailgun.com/en/latest/quickstart-sending.html#send-via-smtp",
  },
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  host: z.string().min(1, "Host is required"),
  port: z.coerce.number().min(1, "Port is required"),
  requiresAuth: z.boolean().default(true),
  supportsTLS: z.boolean().default(true),
  maxSendRate: z.string().min(1, "Max send rate is required"),
  documentation: z.string().url("Must be a valid URL"),
});

export const columns: ColumnDef<SMTPProvider>[] = [
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
          {provider.supportsTLS && (
            <Badge variant="secondary">TLS</Badge>
          )}
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

export function SMTPProviders() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // API call to save SMTP provider
      toast({
        title: "Success",
        description: "SMTP provider added successfully",
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add SMTP provider",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>SMTP Providers</CardTitle>
            <CardDescription>
              Configure and manage your SMTP service providers
            </CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            Add Provider
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={providers}
            filterColumn="name"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add SMTP Provider</DialogTitle>
            <DialogDescription>
              Add a new SMTP service provider configuration
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Provider Name</Label>
              <Input
                id="name"
                placeholder="Gmail SMTP"
                {...form.register("name")}
              />
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
                onCheckedChange={(checked) => form.setValue("requiresAuth", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Supports TLS</Label>
                <div className="text-sm text-muted-foreground">
                  Provider supports TLS encryption
                </div>
              </div>
              <Switch
                checked={form.watch("supportsTLS")}
                onCheckedChange={(checked) => form.setValue("supportsTLS", checked)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Provider</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 