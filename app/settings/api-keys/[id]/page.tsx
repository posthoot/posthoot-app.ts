"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface APIKeyUsage {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  timestamp: string;
  success: boolean;
  error?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface APIKeyStats {
  totalRequests: number;
  successRate: number;
  failureRate: number;
  avgResponseTime: number;
  topEndpoints: {
    endpoint: string;
    count: number;
    successRate: number;
  }[];
  methodBreakdown: {
    method: string;
    count: number;
  }[];
  recentErrors: {
    timestamp: string;
    endpoint: string;
    error: string;
  }[];
}

export default function APIKeyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [usageStats, setUsageStats] = useState<APIKeyUsage[]>([]);
  const [stats, setStats] = useState<APIKeyStats>({
    totalRequests: 0,
    successRate: 0,
    failureRate: 0,
    avgResponseTime: 0,
    topEndpoints: [],
    methodBreakdown: [],
    recentErrors: [],
  });
  const [timeRange, setTimeRange] = useState("24h");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const response = await fetch(`/api/team/api-keys/${params.id}/stats`);
        const data = await response.json();
        setUsageStats(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch API key usage data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageData();
  }, [params.id, timeRange, toast]);

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "POST":
        return "bg-green-50 text-green-700 border-green-200";
      case "PUT":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "DELETE":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex-1 space-y-8">
      <PageHeader heading="API Key Usage">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to API Keys
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </PageHeader>

      <div className="p-8 flex-1 space-y-8">
        {" "}
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-gray-500">in selected period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.successRate}%
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-2">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${stats.successRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgResponseTime}ms
              </div>
              <p className="text-xs text-gray-500">across all endpoints</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.failureRate}%
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-2">
                <div
                  className="h-2 bg-red-500 rounded-full"
                  style={{ width: `${stats.failureRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Top Endpoints & Method Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Endpoints</CardTitle>
              <CardDescription>
                Most frequently accessed endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topEndpoints.map((endpoint) => (
                  <div
                    key={endpoint.endpoint}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{endpoint.endpoint}</p>
                      <div className="text-xs text-gray-500">
                        {endpoint.count} requests
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50">
                      {endpoint.successRate}% success
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Method Breakdown</CardTitle>
              <CardDescription>Distribution of HTTP methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.methodBreakdown.map((method) => (
                  <div
                    key={method.method}
                    className="flex items-center justify-between"
                  >
                    <Badge
                      variant="outline"
                      className={`${getMethodColor(
                        method.method
                      )} w-16 justify-center`}
                    >
                      {method.method}
                    </Badge>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-2 bg-[#007C89] rounded-full"
                          style={{
                            width: `${
                              (method.count / stats.totalRequests) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 w-20 text-right">
                      {method.count} calls
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Recent Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Recent API calls and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageStats.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(
                        new Date(entry.timestamp),
                        "MMM d, yyyy HH:mm:ss"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getMethodColor(entry.method)}`}
                      >
                        {entry.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {entry.endpoint}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={entry.success ? "success" : "destructive"}
                        className={entry.success ? "bg-green-50" : "bg-red-50"}
                      >
                        {entry.success ? "Success" : "Failed"}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.ipAddress || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {entry.userAgent || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Recent Errors */}
        {stats.recentErrors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest error occurrences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentErrors.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        {error.endpoint}
                      </p>
                      <p className="text-sm text-red-600 mt-1">{error.error}</p>
                      <p className="text-xs text-red-500 mt-1">
                        {format(
                          new Date(error.timestamp),
                          "MMM d, yyyy HH:mm:ss"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
