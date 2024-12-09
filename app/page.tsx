import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Overview } from "@/components/overview";
import { RecentActivity } from "@/components/recent-activity";
import { Stats } from "@/components/stats";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        heading="Dashboard" 
        description="Welcome back to your email management dashboard"
      />
      
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground">
              Your email campaign performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stats />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                Campaign performance over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest email campaign activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Campaign Calendar</CardTitle>
              <CardDescription>
                Scheduled and upcoming campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar 
                mode="single" 
                className="rounded-md border shadow-sm" 
              />
            </CardContent>
          </Card>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Detailed metrics for your recent campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Overview />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}