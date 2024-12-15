import { useState, useEffect } from "react";
import { useTeam } from "@/app/providers/team-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { WebhookEventType } from "@prisma/client";
import { Webhook } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExternalLink, Loader2, Plus, RefreshCw, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

interface WebhookWithEvents extends Webhook {
  events: { eventType: WebhookEventType }[];
}

export function WebhookSettings() {
  const { team } = useTeam();
  const [webhooks, setWebhooks] = useState<WebhookWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch webhooks
  const fetchWebhooks = async () => {
    try {
      const response = await fetch(`/api/webhooks?teamId=${team?.id}`);
      if (!response.ok) throw new Error("Failed to fetch webhooks");
      const data = await response.json();
      setWebhooks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load webhooks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (team?.id) {
      fetchWebhooks();
    }
  }, [team?.id]);

  // Delete webhook
  const deleteWebhook = async (id: string) => {
    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete webhook");
      
      setWebhooks((prev) => prev.filter((webhook) => webhook.id !== id));
      toast({
        title: "Success",
        description: "Webhook deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
    }
  };

  // Toggle webhook active state
  const toggleWebhookActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to update webhook");
      
      setWebhooks((prev) =>
        prev.map((webhook) =>
          webhook.id === id ? { ...webhook, isActive } : webhook
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update webhook",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No webhooks configured</CardTitle>
            <CardDescription>
              Add a webhook to receive real-time updates for various events
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Webhook
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {webhook.url}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map(({ eventType }) => (
                        <Badge key={eventType} variant="secondary">
                          {eventType}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={webhook.isActive}
                      onCheckedChange={(checked) =>
                        toggleWebhookActive(webhook.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {webhook.lastAttempt
                      ? format(new Date(webhook.lastAttempt), "PPp")
                      : "Never"}
                    {webhook.lastStatus && (
                      <Badge
                        variant={webhook.lastStatus === 200 ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {webhook.lastStatus}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/settings/webhooks/${webhook.id}/deliveries`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Deliveries
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddWebhookDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          fetchWebhooks();
        }}
      />
    </div>
  );
}

function AddWebhookDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          url,
          events: selectedEvents,
        }),
      });

      if (!response.ok) throw new Error("Failed to create webhook");

      toast({
        title: "Success",
        description: "Webhook created successfully",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Webhook</DialogTitle>
          <DialogDescription>
            Create a new webhook to receive event notifications
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Webhook"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/webhook"
              required
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label>Events</Label>
            <Select
              onValueChange={(value) =>
                setSelectedEvents((prev) =>
                  prev.includes(value as WebhookEventType)
                    ? prev
                    : [...prev, value as WebhookEventType]
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select events" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(WebhookEventType).map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-1 mt-2">
              {selectedEvents.map((event) => (
                <Badge
                  key={event}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedEvents((prev) =>
                      prev.filter((e) => e !== event)
                    )
                  }
                >
                  {event}
                  <span className="ml-1">×</span>
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Webhook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 