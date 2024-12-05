import { AutomationsList } from "@/components/automations/automations-list";
import { AutomationsHeader } from "@/components/automations/automations-header";

export default function AutomationsPage() {
  return (
    <div className="p-8 space-y-8">
      <AutomationsHeader />
      <AutomationsList />
    </div>
  );
}