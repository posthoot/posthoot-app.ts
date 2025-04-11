import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTeam } from "@/app/providers/team-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, Globe, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SERVER_IP = process.env.NEXT_PUBLIC_SERVER_IP || "127.0.0.1";

export function CustomDomains() {
  const [newDomain, setNewDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const { team, refreshTeam } = useTeam();

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (!response.ok) {
        throw new Error("Failed to add domain");
      }

      const data = await response.json();
      refreshTeam();
      setNewDomain("");
      toast.success("Domain added", {
        description:
          "Please verify your domain by adding the required DNS records.",
      });
    } catch (error) {
      toast.error("Failed to add domain. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDomain = async (domainId: string) => {
    setIsVerifying(domainId);
    try {
      const response = await fetch(`/api/settings/domains/${domainId}/verify`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("Verification failed", {
          description:
            data.details?.message ||
            "Please check your DNS settings and try again.",
        });
        return;
      }

      refreshTeam();
      toast.success("Domain verified", {
        description: "Your domain has been verified successfully.",
      });
    } catch (error) {
      toast.error("Failed to verify domain. Please try again.");
    } finally {
      setIsVerifying(null);
    }
  };

  const deleteDomain = async (domainId: string) => {
    try {
      const response = await fetch(`/api/settings/domains/${domainId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete domain");
      }

      refreshTeam();
      toast.success("Domain deleted", {
        description: "The domain has been removed successfully.",
      });
    } catch (error) {
      toast.error("Failed to delete domain. Please try again.");
    }
  };

  useEffect(() => {
    console.log(team?.customDomains, "team.customDomains");
  }, [team?.id]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Domains</CardTitle>
          <CardDescription>
            Add and manage custom domains for your email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addDomain} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="mydomain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isLoading}>
                Add Domain
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DNS Configuration</CardTitle>
          <CardDescription>
            Follow these steps to configure your domain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h4 className="font-semibold mb-2">Step 1: Add A Record</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add the following A record to your domain&apos;s DNS settings:
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm">A</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Value</p>
                  <p className="text-sm font-mono">{SERVER_IP}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-semibold mb-2">Step 2: Verify Domain</h4>
            <p className="text-sm text-muted-foreground">
              After adding the DNS record, click verify on your domain to
              complete the setup.
            </p>
          </div>
        </CardContent>
      </Card>

      {team?.customDomains && team.customDomains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Domains</CardTitle>
            <CardDescription>Manage your configured domains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {team.customDomains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{domain.domain}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={domain.isVerified ? "default" : "secondary"}
                          className={cn(
                            "text-xs",
                            domain.isVerified && "bg-emerald-500"
                          )}
                        >
                          {domain.isVerified ? (
                            <Check className="mr-1 h-3 w-3" />
                          ) : (
                            <X className="mr-1 h-3 w-3" />
                          )}
                          {domain.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                        {domain.isActive && (
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!domain.isVerified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verifyDomain(domain.id)}
                        disabled={isVerifying === domain.id}
                      >
                        {isVerifying === domain.id ? (
                          <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1 h-4 w-4" />
                        )}
                        Verify
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDomain(domain.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
