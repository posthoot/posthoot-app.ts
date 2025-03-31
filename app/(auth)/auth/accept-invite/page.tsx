"use client";

import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AcceptInvitePage() {
  const teamNameSchema = z.object({
    name: z.string(),
  });
  const form = useForm<z.infer<typeof teamNameSchema>>({
    defaultValues: {
      name: "",
    },
    mode: "onBlur",
    resolver: zodResolver(teamNameSchema),
  });

  const handleTeamName = async (data: z.infer<typeof teamNameSchema>) => {
    // TODO: Implement forgot password logic
    console.log("Reset password for:", data.name);
    try {
      //   const response = await fetch("/api/auth/forgot-password", {
      //     method: "POST",
      //     body: JSON.stringify(data),
      //   });
      //   const result = await response.json();
      //   console.log(result);
      //   toast({
      //     title: "Password reset email sent",
      //     description: "Please check your email for instructions",
      //   });
    } catch (error) {
      //   toast({
      //     title: "Error sending reset email",
      //     variant: "destructive",
      //     description: "Please try again later",
      //   });
    }
  };

  return (
    <div className="flex items-center justify-center bg-transparent w-1/2 mx-auto">
      <div className="w-full bg-transparent p-8">
        <div className="mb-8 grid gap-4">
          <div className="grid">
            <h1 className="text-4xl text-center font-normal text-primary-foreground">
              hey, accept the invite to join
              <br />
              {"Team Name"}
            </h1>
            <div className="text-center text-muted-foreground ">
              <div className="cursor-pointer flex mx-auto justify-center items-center w-[150px] !rounded-xl border border-white bg-primary-foreground gap-2 text-foreground px-5 py-2 mt-8">
                <div>Accept Invite</div>
              </div>
              <div className="cursor-pointer flex mx-auto justify-center items-center w-[150px] gap-2 text-primary-foreground mt-2">
                <div>reject invite</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
