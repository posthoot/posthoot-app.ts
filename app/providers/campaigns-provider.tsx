"use client";

import { Campaign } from "@/@prisma/client";
import { createContext, useContext, useEffect, useState } from "react";
import { useTeam } from "./team-provider";

type CampaignsContextType = {
  campaigns: Campaign[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

const CampaignsContext = createContext<CampaignsContextType>({
  campaigns: [],
  loading: false,
  error: null,
  refetch: async () => {},
});

export function CampaignsProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { team } = useTeam();

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/campaigns?teamId=" + team?.id);
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (team?.id) {
      fetchCampaigns();
    }
  }, [team?.id]);

  return (
    <CampaignsContext.Provider
      value={{
        campaigns,
        loading,
        error,
        refetch: fetchCampaigns,
      }}
    >
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignsContext);
  if (!context) {
    throw new Error("useCampaigns must be used within a CampaignsProvider");
  }
  return context;
}
