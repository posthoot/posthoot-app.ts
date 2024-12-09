"use client";

import { PageHeader } from "@/components/page-header";
import { SMTPSettings } from "@/components/settings/smtp-settings";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SMTPPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openCreateSMTPDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="SMTP Settings"
        description="Manage your SMTP servers and configurations"
      >
        <Button
          onClick={openCreateSMTPDialog}
        >
          Add SMTP Server
        </Button>
      </PageHeader>
      <div className="px-6 py-4">
        <SMTPSettings isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
      </div>
    </div>
  );
}
