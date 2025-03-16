"use client";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { useTemplates } from "@/app/providers/templates-provider";
import { useMailingLists } from "@/app/providers/mailinglist-provider";
import { useSMTP } from "@/app/providers/smtp-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TimePicker } from "../ui/time-picker";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Edit, Mail, MoreHorizontal, Trash } from "lucide-react";
import { format } from "date-fns";
import { cn, isEmpty } from "@/lib/utils";
import { useTeam } from "@/app/providers/team-provider";
import { toast } from "@/hooks/use-toast";
import { useCampaigns } from "@/app/providers/campaigns-provider";
import { Campaign, CampaignStatus } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";

export const createCampaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  status: z.enum(Object.values(CampaignStatus) as [string, ...string[]]),
  description: z.string().optional(),
  templateId: z.string().min(1),
  listId: z.string().min(1),
  schedule: z.enum(["ONE_TIME", "RECURRING"]),
  recurringSchedule: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]),
  cronExpression: z
    .string()
    .refine((value) => {
      if (!value) return true; // Allow empty string since it's optional
      try {
        // Basic cron validation - 5 or 6 space-separated fields
        const fields = value.trim().split(/\s+/);
        return fields.length >= 5 && fields.length <= 6;
      } catch {
        return false;
      }
    }, "Invalid cron expression")
    .optional(),
  scheduledFor: z.date().refine((value) => {
    if (!value) return true; // Allow empty string since it's optional
    return value > new Date();
  }, "Scheduled date must be in the future"),
  smtpConfigId: z.string().min(1),
});

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof createCampaignSchema>) => void;
  prefilledData?: Campaign;
}

function CreateCampaignDialog({
  open,
  onOpenChange,
  onSubmit,
  prefilledData,
}: CreateCampaignDialogProps) {
  const form = useForm<z.infer<typeof createCampaignSchema>>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      id: prefilledData?.id || "",
      name: prefilledData?.name || "",
      description: prefilledData?.description || "",
      templateId: prefilledData?.templateId || "",
      listId: prefilledData?.listId || "",
      schedule: prefilledData?.schedule as "ONE_TIME" | "RECURRING" || "ONE_TIME",
      recurringSchedule: prefilledData?.recurringSchedule as "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM" || "DAILY",
      cronExpression: prefilledData?.cronExpression || "",
      scheduledFor: prefilledData?.scheduledFor
        ? new Date(prefilledData.scheduledFor)
        : new Date(),
      smtpConfigId: prefilledData?.smtpConfigId || "",
    },
  });

  const { lists } = useMailingLists();
  const { templates, pagination, isLoading: isLoadingTemplates } = useTemplates();
  const { configs: smtpConfigs } = useSMTP();

  console.log(smtpConfigs, 'smtpConfigs for team');


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {prefilledData ? "Edit Campaign" : "Create Campaign"}
          </DialogTitle>
          <DialogDescription>
            {prefilledData
              ? "Edit your email campaign settings."
              : "Create a new email campaign to send to your subscribers."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Campaign name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Template</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="listId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mailing List</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a list" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smtpConfigId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Provider</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SMTP provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {smtpConfigs?.map((config) => (
                        <SelectItem key={config.id} value={config.id}>
                          <div className="flex flex-col">
                            <span className="font-medium capitalize">
                              {config.provider} - {config.username}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ONE_TIME">One Time</SelectItem>
                      <SelectItem value="RECURRING">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("schedule") === "RECURRING" && (
              <FormField
                control={form.control}
                name="recurringSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurring Schedule</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="CUSTOM">Custom Cron</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("schedule") === "RECURRING" &&
              form.watch("recurringSchedule") === "CUSTOM" && (
                <FormField
                  control={form.control}
                  name="cronExpression"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cron Expression</FormLabel>
                      <FormControl>
                        <Input placeholder="*/5 * * * *" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a valid cron expression (e.g. "0 9 * * *" for
                        daily at 9 AM)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

            {form.watch("schedule") === "ONE_TIME" && (
              <FormField
                control={form.control}
                name="scheduledFor"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Scheduled Date</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <TimePicker
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={field.onChange}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit">
                {prefilledData ? "Update" : "Create"} Campaign
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function CampaignsList({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { team } = useTeam();
  const { campaigns, refetch, loading: isLoading } = useCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  const createCampaign = async (data: z.infer<typeof createCampaignSchema>) => {
    refetch();
    onClose();
    return;
    const campaign = await fetch("/api/campaigns", {
      method: data.id ? "PUT" : "POST",
      body: JSON.stringify({
        ...data,
        status: "SCHEDULED",
        teamId: team?.id,
      }),
    });

    if (campaign.ok) {
      refetch();
      onClose();
      return toast({
        title: "Success",
        description: `Campaign ${data.id ? "updated" : "created"} successfully`,
      });
    }

    return toast({
      title: "Error",
      description: `Error ${data.id ? "updating" : "creating"} campaign`,
      variant: "destructive",
    });
  };

  const deleteCampaign = async (id: string) => {
    const campaign = await fetch(`/api/campaigns/${id}`, {
      method: "DELETE",
    });

    if (campaign.ok) {
      refetch();
      return toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    }

    return toast({
      title: "Error",
      description: "Error deleting campaign",
      variant: "destructive",
    });
  };

  const columns: ColumnDef<Campaign>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "SCHEDULED" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "schedule",
      header: "Frequency",
      cell: ({ row }) => {
        const schedule = row.getValue("schedule") as string;
        return schedule;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date;
        return format(new Date(createdAt), "PPP");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={row.getValue("status") === "SCHEDULED"}
                onClick={() =>
                  createCampaign({
                    ...row.original,
                    status: CampaignStatus.SCHEDULED,
                    schedule: row.original.schedule as "ONE_TIME" | "RECURRING",
                    recurringSchedule: row.original.recurringSchedule as "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM",
                    cronExpression: row.original.cronExpression,
                    scheduledFor: row.original.scheduledFor,
                    smtpConfigId: row.original.smtpConfigId,
                  })
                }
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Now
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCampaign(row.original);
                  onClose();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteCampaign(row.original.id)}
                className="text-red-500"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Campaign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <DataTable columns={columns} data={campaigns} isLoading={isLoading} />
      <CreateCampaignDialog
        open={isOpen}
        onOpenChange={onClose}
        onSubmit={createCampaign}
        prefilledData={selectedCampaign}
      />
    </div>
  );
}
