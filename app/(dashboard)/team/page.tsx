import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamInfo } from "./components/team-info";
import { InviteTeamMember } from "./components/invite-member";
import { TeamInvites } from "./components/team-invites";
import { PageHeader } from "@/components/page-header";
import { Users, Mail, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamSettings } from "./components/team-settings";
import { TemplatesProvider } from "@/app/providers/templates-provider";

export const metadata: Metadata = {
  title: "Team Management | Email Engine",
  description: "Manage your team members and settings",
};

export default function TeamPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        heading="Team Management"
        description="Manage your team members, invites, and settings"
      >
      </PageHeader>

      <div className="flex-1 space-y-4 p-6 pt-4">
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList className="border-b rounded-none w-full justify-start gap-6 bg-transparent h-auto p-0">
            <TabsTrigger
              value="members"
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
            >
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger
              value="invites"
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
            >
              <Mail className="h-4 w-4" />
              Invites
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4 border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Current Team Members</h3>
                <TeamInfo />
              </div>
              <div className="col-span-3 border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Invite New Member</h3>
                <InviteTeamMember />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invites" className="space-y-4">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Pending Invites</h3>
              <TeamInvites />
            </div>
          </TabsContent>
          <TabsContent value="settings" className="space-y-4">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Team Settings</h3>
              <TemplatesProvider>
                <TeamSettings />
              </TemplatesProvider>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
