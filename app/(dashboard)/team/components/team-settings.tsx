"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTemplates } from "@/app/providers/templates-provider";
import { useTeam } from "@/app/providers/team-provider";


export function TeamSettings() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const { toast } = useToast();
  const { templates } = useTemplates();
  const { team } = useTeam();

  useEffect(() => {
    if (team?.emailTemplateId) {
      setSelectedTemplate(team.emailTemplateId);
    }
  }, [team]);

  const handleTemplateChange = async (value: string) => {
    setSelectedTemplate(value);
    try {
      const response = await fetch("/api/team/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteTemplateId: value,
        }),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      toast({
        title: "Success",
        description: "Invite template updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update invite template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="inviteTemplate">Invitation Email Template</Label>
        <Select
          disabled={templates.length === 0}
          value={selectedTemplate}
          onValueChange={handleTemplateChange}
        >
          <SelectTrigger id="inviteTemplate">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
