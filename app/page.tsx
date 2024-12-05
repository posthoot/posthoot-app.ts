import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Overview } from "@/components/overview";
import { RecentActivity } from "@/components/recent-activity";
import { Stats } from "@/components/stats";

export default function Home() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
      </div>

      <Stats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Calendar</h2>
          <Calendar mode="single" className="rounded-md border" />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <Overview />
        </Card>
      </div>

      <RecentActivity />
    </div>
  );
}