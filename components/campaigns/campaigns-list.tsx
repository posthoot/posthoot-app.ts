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
import { Campaign } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";

export function createCampaignDialog({
  isOpen,
  onClose,
  onSubmit,
  prefilledData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  prefilledData?: Campaign;
}) {
  const createCampaignSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
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
    scheduledFor: z.string().refine((value) => {
      if (!value) return true; // Allow empty string since it's optional
      return new Date(value) > new Date();
    }, "Scheduled date must be in the future"),
    smtpConfigId: z.string().min(1),
  });

  const form = useForm({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      id: prefilledData?.id || "",
      name: prefilledData?.name || "",
      description: prefilledData?.description || "",
      templateId: prefilledData?.templateId || "",
      listId: prefilledData?.listId || "",
      schedule: prefilledData?.schedule || "ONE_TIME",
      recurringSchedule: prefilledData?.recurringSchedule || "DAILY",
      cronExpression: prefilledData?.cronExpression || "",
      scheduledFor: prefilledData?.scheduledFor || "",
      smtpConfigId: prefilledData?.smtpConfigId || "",
    },
  });

  const { lists } = useMailingLists();

  const { templates } = useTemplates();

  const { configs: smtpConfigs } = useSMTP();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Create a new email campaign to send to your subscribers.
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
                        Enter a valid cron expression (e.g. &quot;0 9 * *
                        *&quot; for daily at 9 AM)
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
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormLabel>
                        <TimePicker
                          value={field.value as string}
                          onChange={field.onChange}
                        />
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit">Create Campaign</Button>
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
  const createCampaign = async (data: any) => {
    const campaign = await fetch("/api/campaigns", {
      method: data.id ? "PUT" : "POST",
      body: JSON.stringify({
        ...data,
        teamId: team?.id,
      }),
    });

    if (campaign.ok) {
      refetch();
      return toast({
        title: "Campaign created",
        description: "Campaign has been created",
      });
    }

    return toast({
      title: "Error",
      description: "Error creating campaign",
    });
  };

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  const deleteCampaign = async (id: string) => {
    const campaign = await fetch(`/api/campaigns/${id}`, {
      method: "DELETE",
    });

    if (campaign.ok) {
      refetch();
      return toast({
        title: "Campaign deleted",
        description: "Campaign has been deleted",
      });
    }

    return toast({
      title: "Error",
      description: "Error deleting campaign",
    });
  };

  const updateCampaign = async (id: string, data: any) => {
    const campaign = await fetch(`/api/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...data,
      }),
    });

    if (campaign.ok) {
      refetch();
      return toast({
        title: "Campaign updated",
        description: "Campaign has been updated",
      });
    }

    return toast({
      title: "Error",
      description: "Error updating campaign",
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
          <Badge variant={status === "Active" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "sent",
      header: "Progress",
      cell: ({ row }) => {
        const sent = row.getValue("sent") as number;
        const total = row.getValue("total") as number;
        return `${sent} of ${total} sent`;
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
      accessorKey: "recurringSchedule",
      header: "Schedule",
      cell: ({ row }) => {
        const scheduledFor = row.getValue("scheduledFor") as string;
        return isEmpty(scheduledFor)
          ? row.getValue("recurringSchedule")
          : format(new Date(scheduledFor), "PPP");
      },
    },
    {
      accessorKey: "openRate",
      header: "Open Rate",
      cell: ({ row }) => {
        const openRate = row.getValue("openRate") as number;
        return `${openRate}%`;
      },
    },
    {
      accessorKey: "clickRate",
      header: "Click Rate",
      cell: ({ row }) => {
        const clickRate = row.getValue("clickRate") as number;
        return `${clickRate}%`;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date;
        return format(createdAt, "PPP");
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
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
                disabled={row.getValue("status") === "ACTIVE"}
                onClick={() =>
                  updateCampaign(row.original.id, {
                    status: "ACTIVE",
                  })
                }
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Now
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log("edit campaign", row.original);
                  setSelectedCampaign(row.original);
                  onClose();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Campaign
              </DropdownMenuItem>
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
    <>
      <DataTable
        columns={columns}
        data={campaigns as Campaign[]}
        isLoading={isLoading}
      />
      <div key={selectedCampaign?.id}>
        {createCampaignDialog({
          isOpen,
          onClose,
          onSubmit: createCampaign,
          prefilledData: selectedCampaign,
        })}
      </div>
    </>
  );
}
