"use client";

import { AutomationsList } from "@/components/automations/automations-list";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AutomationsPage() {
  const router = useRouter();
  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Automations"
        description="Manage your email automations and preview the result"
      >
        <Button
          onClick={() => {
            router.push("/automations/new/create");
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Automation
        </Button>
      </PageHeader>
      <div className="px-4">
        <AutomationsList />
      </div>
    </div>
  );
}