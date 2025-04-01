"use client";

import { useState } from "react";
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

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  templateId: z.string().min(1, "Template is required"),
  listId: z.string().min(1, "Mailing list is required"),
  deliveryType: z.enum(["SEND_NOW", "SCHEDULE"]),
  schedule: z.enum(["ONE_TIME", "RECURRING"]).optional(),
  recurringSchedule: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"])
    .optional(),
  cronExpression: z.string().optional(),
  scheduledFor: z.date().optional(),
  batchSettings: z.object({
    enabled: z.boolean(),
    batchSize: z.number().min(1).optional(),
    delayBetweenBatches: z.number().min(1).optional(),
    delayUnit: z.enum(["MINUTES", "HOURS"]).optional(),
    optimizeDeliveryTime: z.boolean(),
    timezone: z.string().optional(),
  }),
  smtpConfigId: z.string().min(1, "SMTP configuration is required"),
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
                  !isCurrent && !isCompleted && "border-gray-200"
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
  const [isRecurring, setIsRecurring] = useState(false);
  const [batchingEnabled, setBatchingEnabled] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      description: "",
      deliveryType: "SEND_NOW",
      batchSettings: {
        enabled: false,
        optimizeDeliveryTime: false,
        delayUnit: "MINUTES",
      },
    },
  });

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
      router.push(`/campaigns/${result.data.id}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const renderStepIcon = (step: string) => {
    if (completedSteps.includes(step)) {
      return (
        <div className="h-6 w-6  bg-[#007C89] flex items-center justify-center">
          <CheckIcon className="h-4 w-4 text-white" />
        </div>
      );
    }

    switch (step) {
      case "to":
        return <EnvelopeClosedIcon className="h-6 w-6 text-[#007C89]" />;
      case "from":
        return <PersonIcon className="h-6 w-6 text-[#007C89]" />;
      case "subject":
        return <CheckCircledIcon className="h-6 w-6 text-[#007C89]" />;
      case "schedule":
        return <CalendarIcon className="h-6 w-6 text-[#007C89]" />;
      case "content":
        return <CheckCircledIcon className="h-6 w-6 text-[#007C89]" />;
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
                      <Button variant="outline" size="sm">
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
                            <div className="flex items-center justify-between w-full">
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
                  className="pt-4 border-t"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">List Preview</h4>
                      <p className="text-sm text-muted-foreground">
                        First 5 subscribers in selected list
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
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
                      <FormLabel className="text-base font-semibold text-gray-900">
                        From Address
                      </FormLabel>
                      <FormDescription className="text-gray-600">
                        Choose the email address that will appear in the "From"
                        field
                      </FormDescription>
                    </div>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-200 h-11">
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
                  className="pt-6 border-t space-y-4"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Preview
                    </h4>
                    <div className="rounded-lg border border-gray-200 p-6 bg-gray-50">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            From:
                          </span>
                          <span className="text-sm text-gray-900">
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
                          <span className="text-sm text-gray-900">
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
                          <span className="text-sm text-gray-900">
                            {smtpConfigs.find(
                              (c) => c.id === form.watch("smtpConfigId")
                            )?.provider}
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
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div>
                      <FormLabel className="text-base font-semibold text-gray-900">
                        Subject Line
                      </FormLabel>
                      <FormDescription className="text-gray-600">
                        Write a compelling subject line that will make
                        subscribers want to open your email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Write your subject line here..."
                        className="w-full text-lg border-gray-200 h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("name") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pt-6 border-t space-y-6"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Preview
                    </h4>
                    <div className="rounded-lg border border-gray-200 p-6 bg-gray-50 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10  bg-[#007C89]/10 flex items-center justify-center flex-shrink-0">
                          <PersonIcon className="h-5 w-5 text-[#007C89]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
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
                      <p className="font-medium text-gray-900">
                        {form.watch("name")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#FFFCEE] border border-[#E7B75F]/30 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Subject Line Tips
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5  bg-[#E7B75F]" />
                        Keep it short and clear (4-7 words)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5  bg-[#E7B75F]" />
                        Create a sense of urgency or curiosity
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5  bg-[#E7B75F]" />
                        Avoid spam trigger words
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5  bg-[#E7B75F]" />
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
                  "p-6 border rounded-lg cursor-pointer transition-all",
                  !isScheduled && "border-[#007C89] bg-[#007C89]/5 shadow-sm"
                )}
                onClick={() => setIsScheduled(false)}
              >
                <h3 className="font-semibold text-gray-900 mb-2">Send now</h3>
                <p className="text-sm text-gray-600">
                  Your email will be sent immediately after review
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "p-6 border rounded-lg cursor-pointer transition-all",
                  isScheduled && "border-[#007C89] bg-[#007C89]/5 shadow-sm"
                )}
                onClick={() => setIsScheduled(true)}
              >
                <h3 className="font-semibold text-gray-900 mb-2">Schedule</h3>
                <p className="text-sm text-gray-600">
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
                                  variant="outline"
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal border-gray-200",
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
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                                className="rounded-md border border-gray-200"
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="batchSettings.timezone"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[200px] border-gray-200">
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
                              <SelectItem value="America/Denver">
                                Mountain Time
                              </SelectItem>
                              <SelectItem value="America/Los_Angeles">
                                Pacific Time
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-6 border-t">
                    <FormField
                      control={form.control}
                      name="batchSettings.enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-gray-200 p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => {
                                field.onChange(e);
                                setBatchingEnabled(e.target.checked);
                              }}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="text-base font-medium text-gray-900">
                              Send in batches
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-600">
                              Break up your send into smaller batches
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-6 border-t">
                    <FormField
                      control={form.control}
                      name="batchSettings.recurringSchedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium text-gray-900">
                            Recurrence
                          </FormLabel>
                          <FormDescription className="text-sm text-gray-600">
                            Choose how often to send this email
                          </FormDescription>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[200px] border-gray-200">
                                <SelectValue placeholder="Select recurrence" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DAILY">Daily</SelectItem>
                              <SelectItem value="WEEKLY">Weekly</SelectItem>
                              <SelectItem value="MONTHLY">Monthly</SelectItem>
                              <SelectItem value="YEARLY">Yearly</SelectItem>
                              <SelectItem value="CRON">Custom (Cron)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <AnimatePresence>
                    {batchingEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 pl-8 pt-4"
                      >
                        <div className="grid grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="batchSettings.batchSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium text-gray-900">
                                  Recipients per batch
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    placeholder="500"
                                    className="border-gray-200"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value))
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="batchSettings.delayBetweenBatches"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium text-gray-900">
                                  Time between batches
                                </FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      placeholder="15"
                                      className="border-gray-200"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(parseInt(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                  <Select
                                    onValueChange={(value) =>
                                      form.setValue(
                                        "batchSettings.delayUnit",
                                        value as "MINUTES" | "HOURS"
                                      )
                                    }
                                    defaultValue="MINUTES"
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-[100px] border-gray-200">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="MINUTES">
                                        Minutes
                                      </SelectItem>
                                      <SelectItem value="HOURS">
                                        Hours
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
            className="p-6"
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem className="space-y-6">
                    <div>
                      <FormLabel className="text-base font-semibold text-gray-900">
                        Email Template
                      </FormLabel>
                      <FormDescription className="text-gray-600">
                        Choose a template for your email content
                      </FormDescription>
                    </div>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-200">
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

                    <Button
                      variant="outline"
                      className="border-gray-200 text-[#007C89] hover:text-[#004E54] hover:border-[#007C89]"
                    >
                      Design email
                    </Button>
                  </FormItem>
                )}
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                ←
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Untitled</h1>
              <Button variant="ghost" className="text-[#007C89]">
                Edit name
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-gray-200 text-gray-600 hover:text-gray-900"
              >
                Finish later
              </Button>
              <Button
                type="submit"
                className="bg-[#007C89] text-white hover:bg-[#005F6B] shadow-sm"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 [&[data-state=open]]:bg-gray-50">
                    <div className="flex items-start text-left gap-4">
                      {renderStepIcon("to")}
                      <div>
                        <div className="font-semibold text-gray-900">To</div>
                        <div className="text-sm text-gray-500">
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
                  <AccordionContent className="border-t">
                    {renderStepContent("to")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="from"
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 [&[data-state=open]]:bg-gray-50">
                    <div className="flex items-start text-left gap-4">
                      {renderStepIcon("from")}
                      <div>
                        <div className="font-semibold text-gray-900">From</div>
                        <div className="text-sm text-gray-500">
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
                  <AccordionContent className="border-t">
                    {renderStepContent("from")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="subject"
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 [&[data-state=open]]:bg-gray-50">
                    <div className="flex items-start text-left gap-4">
                      {renderStepIcon("subject")}
                      <div>
                        <div className="font-semibold text-gray-900">
                          Subject
                        </div>
                        <div className="text-sm text-gray-500">
                          {form.watch("name") || "Write your subject line"}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t">
                    {renderStepContent("subject")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="schedule"
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 [&[data-state=open]]:bg-gray-50">
                    <div className="flex items-start text-left gap-4">
                      {renderStepIcon("schedule")}
                      <div>
                        <div className="font-semibold text-gray-900">
                          Send time
                        </div>
                        <div className="text-sm text-gray-500">
                          {isScheduled
                            ? form.watch("scheduledFor")
                              ? format(form.watch("scheduledFor"), "PPP")
                              : "Pick a date"
                            : "Send immediately"}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t">
                    {renderStepContent("schedule")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="content"
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 [&[data-state=open]]:bg-gray-50">
                    <div className="flex items-start text-left gap-4">
                      {renderStepIcon("content")}
                      <div>
                        <div className="font-semibold text-gray-900">
                          Content
                        </div>
                        <div className="text-sm text-gray-500">
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
                  <AccordionContent className="border-t">
                    {renderStepContent("content")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};