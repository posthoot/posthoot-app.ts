"use client";

import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function InviteTeamPage() {
  const [emails, setEmails] = useState<string[]>([""]);

  const handleInviteTeam = async () => {
    const validEmails = emails.filter((email) => {
      try {
        z.string().email().parse(email);
        return true;
      } catch {
        return false;
      }
    });

    if (validEmails.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Implement invite team logic
      console.log("Valid emails:", validEmails);
      toast({
        title: "Success",
        description: "Team invites have been sent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invites",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-transparent w-full md:w-1/2 mx-auto">
      <div className="w-full bg-transparent p-8">
        <div className="mb-8 grid gap-4">
          <div className="grid">
            <h1 className="text-4xl text-center font-normal text-primary-foreground">
              invite your team-mates
            </h1>
            <div className="space-y-4 mx-auto w-[300px] mt-4">
              {emails.map((email, index) => (
                <Input
                  key={index}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const newEmails = [...emails];
                    newEmails[index] = e.target.value;
                    setEmails(newEmails);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ",") {
                      e.preventDefault();
                      if (email.trim() !== "") {
                        setEmails([...emails, ""]);
                      }
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      handleInviteTeam();
                    }
                  }}
                  placeholder="Enter your team member's email"
                  className="!rounded-xl !border-none focus-visible:ring-0"
                />
              ))}
            </div>
            <div className="flex items-center justify-center w-[300px] mx-auto gap-4 mt-2 text-sm">
              <div className="text-right text-primary-foreground w-full">
                press , to enter another email{" "}
              </div>
              <div className="text-right text-primary-foreground w-full">
                press ⏎ to confirm{" "}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
