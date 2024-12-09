"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/app/providers/team-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
  teamId: string;
}

export function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const { toast } = useToast();
  const { team } = useTeam();

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/team/api-keys");
      if (!response.ok) throw new Error("Failed to fetch API keys");
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/team/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!response.ok) throw new Error("Failed to create API key");

      const newKey = await response.json();
      setApiKeys([...apiKeys, newKey]);
      setIsDialogOpen(false);
      setNewKeyName("");

      toast({
        title: "Success",
        description: "API key created successfully. Make sure to copy it now!",
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
      setIsLoading(true);
      const response = await fetch(`/api/team/api-keys/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete API key");

      setApiKeys(apiKeys.filter(key => key.id !== id));
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (team?.id) {
      fetchApiKeys();
    }
  }, [team?.id]);

  const columns: ColumnDef<ApiKey>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "key",
      header: "API Key",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
          {row.getValue("key")}
        </code>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleDateString();
      },
    },
    {
      accessorKey: "lastUsedAt",
      header: "Last Used",
      cell: ({ row }) => {
        const lastUsed = row.getValue("lastUsedAt");
        return lastUsed ? new Date(lastUsed as string).toLocaleDateString() : "Never";
      },
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) => {
        const expiresAt = new Date(row.getValue("expiresAt"));
        const isExpired = expiresAt < new Date();
        return (
          <Badge variant={isExpired ? "destructive" : "outline"}>
            {expiresAt.toLocaleDateString()}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const apiKey = row.original;

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
                onClick={() => navigator.clipboard.writeText(apiKey.key)}
              >
                Copy API Key
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => deleteApiKey(apiKey.id)}
              >
                Delete Key
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Manage API keys for external integrations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Give your API key a name to help you identify it later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">API Key Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={createApiKey} disabled={isLoading}>
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={apiKeys}
        filterColumn="name"
      />
    </div>
  );
} 