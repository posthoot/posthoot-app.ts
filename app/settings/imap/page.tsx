"use client";

import { IMAPProvider } from "@/app/providers/imap-provider";
import { PageHeader } from "@/components/page-header";
import { IMAPSettings } from "@/components/settings/imap-settings";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SMTPPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openCreateIMAPDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="IMAP Settings"
        description="Manage your IMAP servers and configurations"
      >
        <Button onClick={openCreateIMAPDialog}>Add IMAP Server</Button>
      </PageHeader>
      <div className="p-4 mx-auto">
        <IMAPProvider>
          <IMAPSettings
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
          />
        </IMAPProvider>
      </div>
    </div>
  );
}
