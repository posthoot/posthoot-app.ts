"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTeam } from "./team-provider";
import { IMAPConfig } from "@/lib/validations/imap-provider";

type IMAPContextType = {
  configs: IMAPConfig[];
  isLoading: boolean;
  error: Error | null;
  updateConfig: (config: IMAPConfig) => Promise<void>;
  refresh: () => void;
};

const IMAPContext = createContext<IMAPContextType>({
  configs: [],
  isLoading: true,
  error: null,
  updateConfig: async () => {},
  refresh: () => {},
});

export function useIMAP() {
  return useContext(IMAPContext);
}

export function IMAPProvider({ children }: { children: React.ReactNode }) {
  const [configs, setConfigs] = useState<IMAPConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { team } = useTeam();

  const refresh = () => {
    setIsLoading(true);
    fetchConfig();
  };

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/imap?teamId=" + team?.id);
      if (!response.ok) {
        throw new Error("Failed to fetch IMAP configuration");
      }
      const { data } = await response.json();
      setConfigs(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (newConfig: IMAPConfig) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/imap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newConfig,
          teamId: team?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update IMAP configuration");
      }

      const data = await response.json();
      setConfigs(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (team?.id) {
      fetchConfig();
    }
  }, [team?.id]);

  return (
    <IMAPContext.Provider
      value={{
        configs,
        isLoading,
        error,
        updateConfig,
        refresh,
      }}
    >
      {children}
    </IMAPContext.Provider>
  );
}
