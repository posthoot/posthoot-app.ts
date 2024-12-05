"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTeam } from "@/app/providers/team-provider";
import { toast } from "sonner";

const settingsSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function TeamSettings() {
  const { team, refreshTeam } = useTeam();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: team?.name,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/team/${team?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update team settings");

      toast.success("Team settings updated successfully");
      refreshTeam();
    } catch (error) {
      toast.error("Failed to update team settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register("name")}
          placeholder="Team name"
          disabled={loading}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
