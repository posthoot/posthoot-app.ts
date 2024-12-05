"use client";

import { useTeam } from "@/app/providers/team-provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logger } from "@/app/lib/logger";
import { useSession } from "next-auth/react";

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
}

export function TeamInfo() {
  const { team, refreshTeam } = useTeam();
  const { data: session } = useSession();

  const handleRemoveMember = async (memberId: string) => {
    try {
      logger.info(
        "team-info.tsx",
        23,
        "handleRemoveMember",
        "memberId",
        memberId,
        "team"
      );

      const response = await fetch(`/api/team/member/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove team member");

      toast.success("Team member removed successfully");
      refreshTeam();
    } catch (error) {
      logger.error(
        "team-info.tsx",
        39,
        "handleRemoveMember",
        "error",
        error,
        "team"
      );
      toast.error("Failed to remove team member");
    }
  };

  if (!team?.users?.length) {
    return <p className="text-muted-foreground">No team members found</p>;
  }

  return (
    <div className="space-y-4">
      {team.users.map((member: TeamMember) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 border rounded-lg"
          data-testid={`team-member-${member.id}`}
        >
          <div>
            <p className="font-medium">{member.name || member.email}</p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
            <p className="text-sm text-muted-foreground">Role: {member.role}</p>
          </div>
          {team.users.find((user) => user.id === session?.user.id)?.role ===
            "ADMIN" &&
            member.id !== team.id && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveMember(member.id)}
                data-testid={`remove-member-${member.id}`}
              >
                Remove
              </Button>
            )}
        </div>
      ))}
    </div>
  );
}
