import { Metadata } from "next";
import { TeamInfo } from "./components/team-info";
import { InviteTeamMember } from "./components/invite-member";
import { TeamInvites } from "./components/team-invites";
import { TeamSettings } from "./components/team-settings";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Team Management | Email Engine",
  description: "Manage your team members and settings",
};

export default function TeamPage() {
  return (
    <div className="p-6 space-y-8">
      <PageHeader
        heading="Team Management"
        description="Manage your team members, invites, and settings"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Team Members */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Current Team Members</h3>
          <TeamInfo />
        </div>

        {/* Invite New Members */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Invite New Member</h3>
          <InviteTeamMember />
        </div>
      </div>

      {/* Pending Invites */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Pending Invites</h3>
        <TeamInvites />
      </div>

      {/* Team Settings */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Team Settings</h3>
        <TeamSettings />
      </div>
    </div>
  );
}
