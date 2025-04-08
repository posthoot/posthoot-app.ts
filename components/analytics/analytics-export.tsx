"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DownloadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsExportProps {
  teamId?: string;
}

export function AnalyticsExport({ teamId }: AnalyticsExportProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      let url = "/api/analytics/export?";
      if (teamId) {
        url += `teamId=${teamId}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="?([^"]*)"?/);
      const filename = filenameMatch ? filenameMatch[1] : "analytics_export.xlsx";

      // Create blob from response
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Export successful",
        description: "Your analytics data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DownloadIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Export Analytics</CardTitle>
            <CardDescription>
              Download analytics data for further analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* Future enhancement: Add format selection
          <Select disabled>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Excel (XLSX)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          */}
          <Button 
            onClick={handleExport}
            disabled={loading || !teamId}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            {loading ? "Exporting..." : "Export Data"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
