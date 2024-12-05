"use client"

import { useTeam } from "@/app/providers/team-provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TeamInvites() {
  const { team, refreshTeam } = useTeam()

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/team/invite/${inviteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to cancel invite")

      toast.success("Invite cancelled successfully")
      refreshTeam()
    } catch (error) {
      toast.error("Failed to cancel invite")
    }
  }

  if (!team?.invites?.length) {
    return <p className="text-muted-foreground">No pending invites</p>
  }

  return (
    <div className="space-y-4">
      {team.invites.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p className="font-medium">{invite.email}</p>
            <p className="text-sm text-muted-foreground">
              Invited by: {invite.inviter.name || invite.inviter.email}
            </p>
            <p className="text-sm text-muted-foreground">
              Role: {invite.role}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleCancelInvite(invite.id)}
          >
            Cancel Invite
          </Button>
        </div>
      ))}
    </div>
  )
} 