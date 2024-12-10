"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTeam } from "./team-provider";
import { SMTPConfig } from "@/lib/validations/smtp-provider";

type SMTPContextType = {
  configs: SMTPConfig[];
  isLoading: boolean;
  error: Error | null;
  updateConfig: (config: SMTPConfig) => Promise<void>;
  refresh: () => void;
};

const SMTPContext = createContext<SMTPContextType>({
  configs: [],
  isLoading: true,
  error: null,
  updateConfig: async () => {},
  refresh: () => {},
});

export function useSMTP() {
  return useContext(SMTPContext);
}

export function SMTPProvider({ children }: { children: React.ReactNode }) {
  const [configs, setConfigs] = useState<SMTPConfig[]>([]);
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
      const response = await fetch("/api/smtp?teamId=" + team?.id);
      if (!response.ok) {
        throw new Error("Failed to fetch SMTP configuration");
      }
      const data = await response.json();
      setConfigs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (newConfig: SMTPConfig) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/smtp", {
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
        throw new Error("Failed to update SMTP configuration");
      }

      const data = await response.json();
      setConfigs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
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
    <SMTPContext.Provider
      value={{
        configs,
        isLoading,
        error,
        updateConfig,
        refresh,
      }}
    >
      {children}
    </SMTPContext.Provider>
  );
}
