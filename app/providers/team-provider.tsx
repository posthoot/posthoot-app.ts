"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { logger } from "@/app/lib/logger";

interface Team {
  id: string;
  name: string;
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
  }>;
  invites: Array<{
    id: string;
    email: string;
    role: string;
    inviter: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

interface TeamContextType {
  team: Team | null;
  loading: boolean;
  error: Error | null;
  refreshTeam: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeamData = async () => {
    try {
      console.log("fetchTeamData", session);
      if (!session?.user?.id) {
        setTeam(null);
        return;
      }

      const response = await fetch(`/api/team/${session.user.id}`);
      if (!response.ok) throw new Error("Failed to fetch team data");

      const teamData = await response.json();
      setTeam(teamData);

      logger.info({
        fileName: "team-provider.tsx",
        action: "fetchTeamData",
        label: "teamData",
        value: teamData,
        emoji: "✅",
        message: "Team data fetched successfully",
      });
    } catch (err) {
      logger.error({
        fileName: "team-provider.tsx",
        action: "fetchTeamData",
        label: "error",
        value: err,
        emoji: "❌",
        message: "Error fetching team data",
      });
      setError(
        err instanceof Error ? err : new Error("Failed to fetch team data")
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshTeam = async () => {
    setLoading(true);
    await fetchTeamData();
  };

  useEffect(() => {
    fetchTeamData();
  }, [session?.user]);

  return (
    <TeamContext.Provider value={{ team, loading, error, refreshTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}
