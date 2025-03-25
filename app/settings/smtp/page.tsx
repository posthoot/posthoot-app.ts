"use client";

import { SMTPProvider } from "@/app/providers/smtp-provider";
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
        <Button onClick={openCreateSMTPDialog}>Add SMTP Server</Button>
      </PageHeader>
      <div className="p-4 mx-auto">
        <SMTPProvider>
          <SMTPSettings
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
          />
        </SMTPProvider>
      </div>
    </div>
  );
}
