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
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useTeam } from "@/app/providers/team-provider";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();

  const { team } = useTeam();

  console.log(team);

  const onboardingSchema = z.object({
    teamName: z.string().min(2, "Team name must be at least 2 characters"),
    about: z.string().min(2, "About must be at least 2 characters"),
  });

  const form = useForm<z.infer<typeof onboardingSchema>>({
    defaultValues: {
      teamName: team?.name || "",
    },
    mode: "onBlur",
    resolver: zodResolver(onboardingSchema),
  });

  const handleOnboarding = async (data: z.infer<typeof onboardingSchema>) => {
    try {
      toast.loading("Setting up team...");
      const response = await fetch("/api/team", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      await response.json();

      toast.success("Welcome aboard! 🚀");

      router.push("/");
    } catch (error) {
      toast.error("Error setting up team");
    }
  };

  return (
    <div className="flex items-center justify-center bg-transparent w-full md:w-1/2 mx-auto">
      <div className="w-full bg-transparent p-8">
        <div className="mb-8 grid gap-4">
          <div className="grid">
            <h1 className="text-4xl text-center font-normal text-primary-foreground">
              hey 👋🏻, welcome to Posthoot
            </h1>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleOnboarding)}
                className="space-y-6 mx-auto w-[300px] mt-4"
              >
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter your team name"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue("teamName", e.target.value);
                          }}
                          value={team?.name}
                          className="!rounded-xl !border-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="What does your team do?"
                          {...field}
                          className="!rounded-xl !border-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <div className="flex items-center justify-center w-[300px] mx-auto mt-2">
              <div className="text-right text-primary-foreground w-full">
                press ⏎ to confirm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
