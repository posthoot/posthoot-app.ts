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
      <div className="py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                ✨ Configure Your SMTP Settings
              </h2>
              <p className="text-lg text-muted-foreground">
                🚀 Set up and manage your SMTP servers for awesome email
                delivery! 💌 Add multiple providers, keep an eye on performance
                📊, and make sure your emails reach their destination every time
                ✅
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="https://ouch-cdn2.icons8.com/djlps3e0KCEGuy_QMYzvOUefYqAYtWSK7Qf32vCtQ3c/rs:fit:651:456/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNDMw/LzUzMTUyNDMyLTdl/YWQtNDc0Yi05NzQ4/LTdjMmZjYzhjNzE3/MC5zdmc.png"
                alt="SMTP Configuration Illustration"
                className="w-full max-w-sm"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="py-4 max-w-6xl mx-auto">
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
