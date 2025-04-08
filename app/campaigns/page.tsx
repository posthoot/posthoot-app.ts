"use client";

import { CampaignsList } from "@/components/campaigns/campaigns-list";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TemplatesProvider } from "../providers/templates-provider";
import { MailingListProvider } from "../providers/mailinglist-provider";
import { SMTPProvider } from "../providers/smtp-provider";
import { CampaignsProvider } from "../providers/campaigns-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FullScreenCalendar } from "@/components/ui/full-screen-calendar";
import Link from "next/link";
export default function CampaignsPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex-1">
      <PageHeader heading="All campaigns">
        <Link href="/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Campaign
          </Button>
        </Link>
      </PageHeader>

      <div className="flex bg-primary/10 p-8 items-center gap-4 justify-between">
        <div className="flex flex-col w-1/2 gap-2">
          <span className="text-4xl font-semibold">
            Create and manage your email campaigns
          </span>
          <span className="text-muted-foreground font-inter">
            Design, schedule and track your email campaigns to engage with your
            audience and drive results.
          </span>
        </div>
        <img
          src="https://ouch-cdn2.icons8.com/1_NPzcdxf6kCIpExHBJ5X63jDc6HGbsZ7YJYPwGw_MU/rs:fit:576:456/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvMzIz/LzU0YjhmYmE2LTEy/NzQtNDM5Ny1iM2Rl/LWE4NGU4Zjc3MzZi/OC5zdmc.png"
          alt=""
          width={200}
        />
      </div>

      <div className="px-4 mt-4">
        <TemplatesProvider>
          <MailingListProvider>
            <SMTPProvider>
              <CampaignsProvider>
                <Tabs defaultValue="all">
                  <TabsList className="h-auto rounded-none border-b border-border bg-transparent p-0">
                    <TabsTrigger
                      className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
                      value="all"
                    >
                      List
                    </TabsTrigger>
                    <TabsTrigger
                      className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
                      value="scheduled"
                    >
                      Calendar
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">
                    <CampaignsList />
                  </TabsContent>
                  <TabsContent value="scheduled">
                    <FullScreenCalendar data={[]} />
                  </TabsContent>
                </Tabs>
              </CampaignsProvider>
            </SMTPProvider>
          </MailingListProvider>
        </TemplatesProvider>
      </div>
    </div>
  );
}
