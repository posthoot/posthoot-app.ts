"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { APIKey } from "@/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent } from "@/components/ui/tooltip";
import { PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { FormControl, FormMessage } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import { FormItem, Form } from "@/components/ui/form";
import { Popover } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  expiresAt: z
    .date()
    .optional()
    .refine((date) => date && date > new Date(), {
      message: "Expiration date must be in the future",
    }),
});

export default function APIKeysPage() {
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      expiresAt: new Date(new Date().setDate(new Date().getDate() + 9000)),
    },
  });

  const router = useRouter();

  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/team/api-keys/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete API key");

      setApiKeys(apiKeys.filter((key) => key.id !== id));
      toast.success("API key deleted successfully");
    } catch (error) {
      toast.error("Failed to delete API key");
    }
  };

  const toggleApiKey = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/team/api-keys/${id}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) throw new Error("Failed to update API key");

      setApiKeys(
        apiKeys?.map((key) => (key.id === id ? { ...key, isActive } : key))
      );
      toast.success(`API key ${isActive ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      toast.error("Failed to update API key");
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/team/api-keys");
      const { data } = await response.json();
      setApiKeys(data.data);
      if (data.total > 0) {
        setSelectedKey(data.data[0].id);
      }
      console.log(apiKeys, "FETCHED");
    } catch (error) {
      toast.error("Failed to fetch API keys");
    }
  };

  const createApiKey = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/team/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to create API key");

      const newKey = await response.json();
      setApiKeys([...apiKeys, newKey]);
      toast.success("API key created successfully");
    } catch (error) {
      toast.error("Failed to create API key");
    } finally {
      setIsCreateKeyOpen(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return (
    <div className="flex-1">
      <PageHeader heading="API keys">
        <Sheet open={isCreateKeyOpen} onOpenChange={setIsCreateKeyOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">Create A Key</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New API Key</SheetTitle>
              <SheetDescription>
                Give your API key a name to help you identify its use.
              </SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(createApiKey)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="My API Key" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date (Optional)</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={
                                field.value
                                  ? new Date(
                                      new Date(field.value).setDate(
                                        new Date(field.value).getDate() + 90
                                      )
                                    )
                                  : undefined
                              }
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateKeyOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type={isLoading ? "button" : "submit"}
                  >
                    {isLoading ? "Creating..." : "Create Key"}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </PageHeader>

      {/* Three Column Section */}
      <div className="grid grid-cols-3 gap-4 p-8">
        {/* About the API */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">About the API</h2>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex-shrink-0">
              <img
                src="https://ouch-cdn2.icons8.com/zS22SHejvFvfPbRZo2sPhvNt_3z4AZHzT9_bRJKRSEc/rs:fit:541:456/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNTYy/L2VkZjI2ODRkLWQw/MWEtNDFjYi04MTRk/LTgzNzZkOWVjZDk2/ZS5zdmc.png"
                alt="API icon"
                className="w-full h-full"
              />
            </div>
            <p className="text-gray-600">
              The Posthoot API makes it easy for programmers to integrate
              Posthoot's features into other applications.
            </p>
          </div>
          <Button variant="outline" className="w-max justify-start">
            Read The API Documentation
          </Button>
        </div>

        {/* Developing an app? */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Developing an app?</h2>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex-shrink-0">
              <img
                src="https://ouch-cdn2.icons8.com/7rw3oTP18wQ1-wbXmGrvGUnfU8neYH5YbCJ_kARPDJo/rs:fit:368:435/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvMjk3/LzVjNDFmYzNjLTJj/N2MtNGI3NS1hY2U1/LTdhMjQwMjQyYmI5/NC5zdmc.png"
                alt="Developer icon"
                className="w-full h-full"
              />
            </div>
            <p className="text-gray-600">
              Writing your own application that requires access to other
              Posthoot users' accounts? Check out our{" "}
              <Link href="#" className="text-[#007C89] hover:underline">
                OAuth2 API documentation
              </Link>
              , then register your app.
            </p>
          </div>
          <Button variant="outline" className="w-max justify-start">
            Register And Manage Your Apps
          </Button>
        </div>

        {/* API Security */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">API Security</h2>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex-shrink-0">
              <img
                src="https://ouch-cdn2.icons8.com/JRinq59LHQii7iLIZpLJAAcM3NVFzlK8izhapTSFMyk/rs:fit:368:207/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNjM1/LzQwMGQxYzA4LWNj/YTEtNDQxOS05ZjU0/LWVlYTAyMTQ3NjIw/Yy5zdmc.png"
                alt="Security icon"
                className="w-full h-full"
              />
            </div>
            <p className="text-gray-600">
              Learn about our security best practices and how to keep your API
              integrations safe.
            </p>
          </div>
          <Button variant="outline" className="w-max justify-start">
            View Security Guidelines
          </Button>
        </div>
      </div>

      {/* Your API keys section */}
      <div className="space-y-4 p-16">
        <h2 className="text-2xl font-semibold">Your API keys</h2>
        <p className="text-gray-600">
          You can review, revoke or generate new API keys below.{" "}
          <Link href="#" className="text-[#007C89] hover:underline">
            Learn more about generating, revoking, and accessing API keys here
          </Link>
          .
        </p>

        {/* API Keys Table */}
        <div className="overflow-hidden mt-4">
          <Table>
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            {apiKeys?.length > 0 ? (
              <TableBody>
                {apiKeys?.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{apiKey.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Created {format(new Date(apiKey.createdAt), "PP")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              onClick={() =>
                                navigator.clipboard.writeText(apiKey.key)
                              }
                            >
                              {apiKey.key.slice(0, 10)}...
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Click to copy</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={apiKey.isDeleted ? "destructive" : "success"}
                      >
                        {apiKey.isDeleted ? "Deleted" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/settings/api-keys/${apiKey.id}`)
                          }
                        >
                          Stats
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleApiKey(apiKey.id, !apiKey.isDeleted)
                          }
                        >
                          {apiKey.isDeleted ? "Enable" : "Disable"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteApiKey(apiKey.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No API keys found
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}
