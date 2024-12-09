import { AutomationsList } from "@/components/automations/automations-list";
import { AutomationsHeader } from "@/components/automations/automations-header";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Plus } from "lucide-react";

export default function AutomationsPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Automations"
        description="Manage your email automations and preview the result"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Automation
        </Button>
      </PageHeader>
      <div className="px-4">
        <AutomationsList />
      </div>
    </div>
  );
}