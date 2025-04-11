"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  TemplatesProvider,
  useTemplates,
} from "@/app/providers/templates-provider";
import {
  MailingListProvider,
  useMailingLists,
} from "@/app/providers/mailinglist-provider";
import { SMTPProvider, useSMTP } from "@/app/providers/smtp-provider";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CalendarIcon,
  CheckCircledIcon,
  CircleIcon,
  EnvelopeClosedIcon,
  PersonIcon,
  CaretDownIcon,
  PlusIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTeam } from "@/app/providers/team-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { toast } from "sonner";

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  templateId: z
    .string()
    .uuid("Template ID must be a valid UUID")
    .min(1, "Template is required"),
  status: z
    .enum(["DRAFT", "SCHEDULED", "SENDING", "COMPLETED", "FAILED", "PAUSED"])
    .default("DRAFT"),
  scheduledFor: z.date().optional(),
  schedule: z.enum(["ONE_TIME", "RECURRING"]).optional(),
  listId: z
    .string()
    .uuid("List ID must be a valid UUID")
    .min(1, "Mailing list is required"),
  recurringSchedule: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"])
    .optional(),
  cronExpression: z.string().optional(),
  batchSize: z.number().min(1).default(100),
  processed: z.number().default(0),
  batchDelay: z.number().min(1).optional(),
  timezone: z.string().default("America/New_York"),
  subject: z.string().min(1, "Subject is required"),
  smtpConfigId: z
    .string()
    .uuid("SMTP configuration ID must be a valid UUID")
    .min(1, "SMTP configuration is required"),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

type Step = {
  id: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    id: "to",
    title: "To",
    description: "Choose your recipients",
  },
  {
    id: "from",
    title: "From",
    description: "Set sender details",
  },
  {
    id: "subject",
    title: "Subject",
    description: "Write your subject line",
  },
  {
    id: "schedule",
    title: "Send time",
    description: "When should we send this email?",
  },
  {
    id: "content",
    title: "Content",
    description: "Design the content for your email",
  },
];

function Timeline({
  currentStep,
  steps,
  onClick,
}: {
  currentStep: string;
  steps: Step[];
  onClick: (id: string) => void;
}) {
  return (
    <div className="relative py-4">
      <div className="absolute left-0 top-[22px] h-[2px] w-full bg-[#E7B75F] opacity-20" />
      <div className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isCompleted =
            steps.findIndex((s) => s.id === currentStep) > index;
          const isCurrent = currentStep === step.id;

          return (
            <motion.div
              key={step.id}
              className="flex flex-col items-center gap-3"
              initial={false}
              animate={{ scale: isCurrent ? 1.05 : 1 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => onClick(step.id)}
                className={cn(
                  "h-12 w-12  border-[3px] flex items-center justify-center bg-white transition-all duration-200",
                  isCurrent &&
                    "border-[#E7B75F] shadow-[0_0_0_4px_rgba(231,183,95,0.2)]",
                  isCompleted && "border-[#007C89] bg-[#007C89] text-white",
                  !isCurrent && !isCompleted && "border-muted"
                )}
              >
                {isCompleted ? (
                  <CheckCircledIcon className="h-5 w-5" />
                ) : (
                  <CircleIcon
                    className={cn(
                      "h-5 w-5",
                      isCurrent && "text-[#E7B75F]",
                      !isCurrent && "text-gray-400"
                    )}
                  />
                )}
              </motion.button>
              <div className="flex flex-col items-center text-center">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-[#241C15]",
                    isCompleted && "text-[#007C89]",
                    !isCurrent && !isCompleted && "text-gray-500"
                  )}
                >
                  {step.title}
                </span>
                <span className="text-xs text-gray-500 max-w-[120px]">
                  {step.description}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <SMTPProvider>
      <TemplatesProvider>
        <MailingListProvider>
          <NewCampaignForm />
        </MailingListProvider>
      </TemplatesProvider>
    </SMTPProvider>
  );
}

const NewCampaignForm = () => {
  const router = useRouter();
  const { team } = useTeam();
  const { templates } = useTemplates();
  const { lists } = useMailingLists();
  const { configs: smtpConfigs } = useSMTP();
  const [currentStep, setCurrentStep] = useState("to");
  const [isScheduled, setIsScheduled] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      description: "",
      templateId: "",
      status: "DRAFT",
      listId: "",
      smtpConfigId: "",
      schedule: "ONE_TIME",
      scheduledFor: undefined,
      recurringSchedule: undefined,
      cronExpression: undefined,
      batchSize: 100,
      processed: 0,
      batchDelay: undefined,
      timezone: "America/New_York",
    },
  });

  useEffect(() => {
    if (form.formState.errors) {
      toast.error("Please fill in all fields", {
        description: Object.values(form.formState.errors).join(", "),
      });
    }
  }, [form.formState.errors]);

  const onSubmit = async (data: CampaignFormValues) => {
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          teamId: team?.id,
          status: "DRAFT",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create campaign");
      }

      const result = await response.json();
      router.push(`/campaigns/${result.campaign.id}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const renderStepIcon = (step: string) => {
    if (completedSteps.includes(step)) {
      return (
        <div className="h-6 w-6  bg-primary flex items-center justify-center">
          <CheckIcon className="h-4 w-4 text-white" />
        </div>
      );
    }

    switch (step) {
      case "to":
        return <EnvelopeClosedIcon className="h-6 w-6 text-primary" />;
      case "from":
        return <PersonIcon className="h-6 w-6 text-primary" />;
      case "subject":
        return <CheckCircledIcon className="h-6 w-6 text-primary" />;
      case "schedule":
        return <CalendarIcon className="h-6 w-6 text-primary" />;
      case "content":
        return <CheckCircledIcon className="h-6 w-6 text-primary" />;
      default:
        return null;
    }
  };

  const renderStepContent = (step: string) => {
    switch (step) {
      case "to":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="listId"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel className="text-base">
                          Mailing List
                        </FormLabel>
                        <FormDescription>
                          Choose the list of subscribers for this campaign
                        </FormDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/audience/lists")}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create New List
                      </Button>
                    </div>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a mailing list" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            <div className="flex gap-2 items-center justify-between w-full">
                              <span>{list.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {list?._count?.subscribers} subscribers
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

              {form.watch("listId") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pt-4 border-t border-muted"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">List Preview</h4>
                      <p className="text-sm text-muted-foreground">
                        First 5 subscribers in selected list
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/lists/${form.watch("listId")}`)
                      }
                    >
                      View All
                    </Button>
                  </div>
                  <div className="mt-2 space-y-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <PersonIcon className="h-4 w-4" />
                        <span>subscriber{i}@example.com</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case "from":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="smtpConfigId"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div>
                      <FormLabel className="text-base font-semibold text-sidebar-foreground">
                        From Address
                      </FormLabel>
                      <FormDescription className="text-sidebar-foreground">
                        Choose the email address that will appear in the "From"
                        field
                      </FormDescription>
                    </div>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-muted h-11">
                          <SelectValue placeholder="Select sender email" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {smtpConfigs.map((config) => (
                          <SelectItem key={config.id} value={config.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {config.fromEmail}
                              </span>
                              <span className="text-sm">
                                via {config.host} ({config.provider})
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

              {form.watch("smtpConfigId") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pt-6 border-t border-muted space-y-4"
                >
                  <div>
                    <h4 className="font-semibold text-sidebar-foreground mb-3">
                      Preview
                    </h4>
                    <div className="rounded-lg border border-muted p-6 bg-muted">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            From:
                          </span>
                          <span className="text-sm text-sidebar-foreground">
                            {
                              smtpConfigs.find(
                                (c) => c.id === form.watch("smtpConfigId")
                              )?.fromEmail
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            Reply-To:
                          </span>
                          <span className="text-sm text-sidebar-foreground">
                            {
                              smtpConfigs.find(
                                (c) => c.id === form.watch("smtpConfigId")
                              )?.fromEmail
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            Provider:
                          </span>
                          <span className="text-sm text-sidebar-foreground">
                            {
                              smtpConfigs.find(
                                (c) => c.id === form.watch("smtpConfigId")
                              )?.provider
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case "subject":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div>
                      <FormLabel className="text-base font-semibold text-sidebar-foreground">
                        Subject Line
                      </FormLabel>
                      <FormDescription className="text-sidebar-foreground">
                        Write a compelling subject line that will make
                        subscribers want to open your email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Write your subject line here..."
                        className="w-full text-lg border-muted h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("subject") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pt-6 border-t border-muted space-y-6"
                >
                  <div>
                    <h4 className="font-semibold text-sidebar-foreground mb-3">
                      Preview
                    </h4>
                    <div className="rounded-lg border border-muted p-6 bg-muted space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10  bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <PersonIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sidebar-foreground">
                              {smtpConfigs.find(
                                (c) => c.id === form.watch("smtpConfigId")
                              )?.username || "Sender"}
                            </span>
                            <span className="text-sm text-gray-500">Today</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <span>to me</span>
                            <CaretDownIcon className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                      <p className="font-medium text-sidebar-foreground">
                        {form.watch("subject")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted border border-muted rounded-lg p-6">
                    <h4 className="font-semibold text-sidebar-foreground mb-3">
                      Subject Line Tips
                    </h4>
                    <ul className="text-sm text-sidebar-foreground space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5  bg-primary" />
                        Keep it short and clear (4-7 words)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5  bg-primary" />
                        Create a sense of urgency or curiosity
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5  bg-primary" />
                        Avoid spam trigger words
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5  bg-primary" />
                        Personalize when possible
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case "schedule":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 space-y-8"
          >
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "p-6 border border-muted rounded-lg cursor-pointer transition-all",
                  !isScheduled && "border-primary bg-primary/5 shadow-sm"
                )}
                onClick={() => setIsScheduled(false)}
              >
                <h3 className="font-semibold text-sidebar-foreground mb-2">
                  Send now
                </h3>
                <p className="text-sm text-sidebar-foreground">
                  Your email will be sent immediately after review
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "p-6 border border-muted rounded-lg cursor-pointer transition-all",
                  isScheduled && "border-primary bg-primary/5 shadow-sm"
                )}
                onClick={() => setIsScheduled(true)}
              >
                <h3 className="font-semibold text-sidebar-foreground mb-2">
                  Schedule
                </h3>
                <p className="text-sm text-sidebar-foreground">
                  Pick a date and time to send your email
                </p>
              </motion.div>
            </div>

            <AnimatePresence>
              {isScheduled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6"
                >
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="scheduledFor"
                      render={({ field }) => (
                        <FormItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal border-muted",
                                    !field.value && "text-gray-500"
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) =>
                                  field.onChange(date || undefined)
                                }
                                disabled={(date) =>
                                  date < new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                hasTime
                                initialFocus
                                className="rounded-md border border-muted"
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[200px] border-muted">
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">
                                Eastern Time
                              </SelectItem>
                              <SelectItem value="America/Chicago">
                                Central Time
                              </SelectItem>
                              <SelectItem value="America/Los_Angeles">
                                Pacific Time
                              </SelectItem>
                              <SelectItem value="Asia/Tokyo">
                                Tokyo Time
                              </SelectItem>
                              <SelectItem value="Asia/Shanghai">
                                Shanghai Time
                              </SelectItem>
                              <SelectItem value="Europe/London">
                                London Time
                              </SelectItem>
                              <SelectItem value="Asia/Kolkata">
                                Kolkata Time
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-6 border-t border-muted">
                    <FormField
                      control={form.control}
                      name="schedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium text-sidebar-foreground">
                            Schedule Type
                          </FormLabel>
                          <FormDescription className="text-sm text-sidebar-foreground">
                            Choose how to schedule this campaign
                          </FormDescription>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[200px] border-muted">
                                <SelectValue placeholder="Select schedule type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ONE_TIME">One Time</SelectItem>
                              <SelectItem value="RECURRING">
                                Recurring
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("schedule") === "RECURRING" && (
                    <div className="pt-6 border-t">
                      <FormField
                        control={form.control}
                        name="recurringSchedule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-sidebar-foreground">
                              Recurrence
                            </FormLabel>
                            <FormDescription className="text-sm text-sidebar-foreground">
                              Choose how often to send this email
                            </FormDescription>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-[200px] border-muted">
                                  <SelectValue placeholder="Select recurrence" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="DAILY">Daily</SelectItem>
                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                <SelectItem value="CUSTOM">
                                  Custom (Cron)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {form.watch("recurringSchedule") === "CUSTOM" && (
                    <div className="pt-6 border-t">
                      <FormField
                        control={form.control}
                        name="cronExpression"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-sidebar-foreground">
                              Cron Expression
                            </FormLabel>
                            <FormDescription className="text-sm text-sidebar-foreground">
                              Enter a cron expression for custom scheduling
                            </FormDescription>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="* * * * *"
                                className="w-full border-muted"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case "content":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 grid gap-3"
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem className="space-y-6">
                    <div>
                      <FormLabel className="text-base font-semibold text-sidebar-foreground">
                        Email Template
                      </FormLabel>
                      <FormDescription className="text-sidebar-foreground">
                        Choose a template for your email content
                      </FormDescription>
                    </div>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-muted">
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
            </div>
            <Link href="/templates/new" className="!mt-2">
              <Button type="button" variant="secondary">
                Design email
              </Button>
            </Link>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="min-h-screen">
          <div className="border-b border-muted">
            <div className="container mx-auto">
              <div className="flex items-center justify-between py-4 px-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                  >
                    ←
                  </Button>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Give your campaign a name"
                        className="w-full"
                      />
                    )}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Finish later
                  </Button>
                  <Button type="submit" className="text-white shadow-sm">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto py-8">
            <div className="max-w-3xl mx-auto">
              <Accordion
                type="single"
                collapsible
                defaultValue="to"
                value={currentStep}
                onValueChange={setCurrentStep}
                className="space-y-4"
              >
                <AccordionItem
                  value="to"
                  className="border border-muted rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-card [&[data-state=open]]:bg-card dark:text-white">
                    <div className="flex items-start text-left gap-4">
                      {renderStepIcon("to")}
                      <div>
                        <div className="font-semibold text-muted-foreground">
                          To
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {form.watch("listId")
                            ? `${
                                lists.find((l) => l.id === form.watch("listId"))
                                  ?.name || "Selected list"
                              }`
                            : "Choose your recipients"}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-muted">
                    {renderStepContent("to")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="from"
                  className="border border-muted rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-card [&[data-state=open]]:bg-card dark:text-white">
                    <div className="flex items-start text-left gap-4">
                      {renderStepIcon("from")}
                      <div>
                        <div className="font-semibold text-muted-foreground">
                          From
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {form.watch("smtpConfigId")
                            ? `${
                                smtpConfigs.find(
                                  (c) => c.id === form.watch("smtpConfigId")
                                )?.fromEmail || "Selected sender"
                              }`
                            : "Set sender details"}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-muted">
                    {renderStepContent("from")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="subject"
                  className="border border-muted rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-card [&[data-state=open]]:bg-card dark:text-white">
                    <div className="flex items-start text-left gap-4">
                      {renderStepIcon("subject")}
                      <div>
                        <div className="font-semibold text-muted-foreground">
                          Subject
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {form.watch("subject") || "Write your subject line"}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-muted">
                    {renderStepContent("subject")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="schedule"
                  className="border border-muted rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-card [&[data-state=open]]:bg-card dark:text-white">
                    <div className="flex items-start text-left gap-4">
                      {renderStepIcon("schedule")}
                      <div>
                        <div className="font-semibold text-muted-foreground">
                          Send time
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isScheduled
                            ? form.watch("scheduledFor")
                              ? format(form.watch("scheduledFor"), "PPP")
                              : "Pick a date"
                            : "Send immediately"}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-muted">
                    {renderStepContent("schedule")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="content"
                  className="border border-muted rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-card [&[data-state=open]]:bg-card dark:text-white">
                    <div className="flex items-start text-left gap-4">
                      {renderStepIcon("content")}
                      <div>
                        <div className="font-semibold text-muted-foreground">
                          Content
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {form.watch("templateId")
                            ? `${
                                templates.find(
                                  (t) => t.id === form.watch("templateId")
                                )?.name || "Selected template"
                              }`
                            : "Design your email"}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-muted">
                    {renderStepContent("content")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
