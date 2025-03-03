"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import Link from "next/link";
const API_SCOPES = {
  templates: ["read", "write"],
};

// Generate available scopes from API_SCOPES
const AVAILABLE_SCOPES = Object.values(API_SCOPES)
  .flat()
  .reduce((acc, scope) => {
    const [resource, action] = scope.split(":");
    acc[scope] = `${
      action?.charAt(0).toUpperCase() + action?.slice(1)
    } ${resource}`;
    return acc;
  }, {} as Record<string, string>);

interface ApiKey {
  id: string;
  name: string;
  key: string;
  teamId: string;
  createdAt: string;
  lastUsedAt: string;
  updatedAt: string;
  expiresAt: string;
  isDeleted: boolean;
}

interface ApiKeyUsageStats {
  totalRequests: number;
  successRate: number;
  topEndpoints: { endpoint: string; count: number }[];
  recentErrors: { timestamp: string; error: string }[];
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  expiresAt: z
    .date()
    .optional()
    .refine((date) => date && date > new Date(), {
      message: "Expiration date must be in the future",
    }),
  scopes: z.array(z.string()),
  rateLimit: z.number().min(1).max(10000),
});

export function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<ApiKeyUsageStats | null>(null);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      scopes: [],
      rateLimit: 1000,
    },
  });

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
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive",
      });
    }
  };

  const fetchUsageStats = useCallback(
    async (keyId: string) => {
      try {
        const response = await fetch(`/api/team/api-keys/${keyId}/stats`);
        const data = await response.json();
        setUsageStats(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch usage statistics",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchApiKeys();
  }, []);

  useEffect(() => {
    if (selectedKey) {
      fetchUsageStats(selectedKey);
    }
  }, [selectedKey, fetchUsageStats]);

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
      toast({
        title: "Success",
        description: "API key created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/team/api-keys/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete API key");

      setApiKeys(apiKeys.filter((key) => key.id !== id));
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: `API key ${
          isActive ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">API Keys</h2>
          <div className="flex gap-2 items-center">
            <span className="text-sm">
              Check out our API docs for more information on how to use our API.
            </span>
            <Link href="/api-docs">
              <span className="text-sm underline">API Docs</span>
            </Link>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create API Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
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

                <FormField
                  control={form.control}
                  name="rateLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Limit (requests per hour)</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10000}
                          step={100}
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Current limit: {field.value} requests/hour
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scopes"
                  render={() => (
                    <FormItem>
                      <FormLabel>Permissions</FormLabel>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(AVAILABLE_SCOPES).map(
                          ([scope, description]) => (
                            <FormField
                              key={scope}
                              control={form.control}
                              name="scopes"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(scope)}
                                      onCheckedChange={(checked) => {
                                        const updatedScopes = checked
                                          ? [...field.value, scope]
                                          : field.value?.filter(
                                              (s) => s !== scope
                                            );
                                        field.onChange(updatedScopes);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {description}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          )
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading}>
                  Create Key
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
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
                            onClick={() => setSelectedKey(apiKey.id)}
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
          </CardContent>
        </Card>

        {selectedKey && usageStats && (
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                View detailed usage statistics for the selected API key
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Total Requests</div>
                    <div className="text-2xl font-bold">
                      {usageStats.totalRequests}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Success Rate</div>
                    <div className="text-2xl font-bold">
                      {usageStats.successRate}%
                    </div>
                  </div>
                </div>

                {usageStats?.topEndpoints?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Top Endpoints
                    </div>
                    <div className="space-y-2">
                      {usageStats.topEndpoints.map((endpoint) => (
                        <div
                          key={endpoint.endpoint}
                          className="flex justify-between items-center"
                        >
                          <div className="text-sm">{endpoint.endpoint}</div>
                          <Badge variant="secondary">{endpoint.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {usageStats?.recentErrors?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Recent Errors</div>
                    <div className="space-y-2">
                    {usageStats?.recentErrors?.map((error, index) => (
                      <div key={index} className="text-sm text-destructive">
                        {format(new Date(error.timestamp), "PP")} -{" "}
                        {error.error}
                      </div>
                    ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
