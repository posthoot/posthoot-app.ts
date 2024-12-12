"use client";

import { useEffect, useState } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { signIn, useSession } from "next-auth/react";
import { Team, TeamInvite, User } from "@prisma/client";

const acceptInviteSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

export default function AcceptInvitationPage() {
  const params = useParams();
  const { toast } = useToast();
  const [inviteData, setInviteData] = useState<
    | (TeamInvite & {
        inviter: User;
        team: Team;
      })
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session } = useSession();

  if (session) {
    return redirect("/");
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
  });

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await fetch(
          `/api/team/invite/${params.id}?redirect=false`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch invite");
        }
        const data = await response.json();
        setInviteData(data.invitation);
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid or expired invitation",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvite();
  }, [params.id, toast]);

  const onSubmit = async (data: AcceptInviteFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/team/invite/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept invitation");
      }

      toast({
        title: "Success",
        description: "Account created successfully. Please log in.",
      });

      return signIn("credentials", {
        email: inviteData.email,
        password: data.password,
        redirect: true,
        callbackUrl: "/",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (inviteData.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Expired Invitation</CardTitle>
            <CardDescription>
              This invitation has expired. Please request a new invitation.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <img
            src={inviteData.team.logoUrl}
            alt={inviteData.inviter.name}
            width={40}
            height={40}
            className="rounded-full mb-3"
          />
          <CardTitle>Accept Team Invitation</CardTitle>
          <CardDescription>
            {inviteData.inviter.name} has invited you to join{" "}
            {inviteData.team.name}. Create your account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="email"
                value={inviteData.email}
                disabled
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground">
                You'll use this email to log in
              </p>
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Accept & Create Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
