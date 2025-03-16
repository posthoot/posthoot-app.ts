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
import React, { use, useState } from "react";
import { EyeIcon } from "lucide-react";
import { EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}): React.ReactNode {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = use(params);
  const router = useRouter();

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleResetPassword = async (
    data: z.infer<typeof resetPasswordSchema>
  ) => {
    try {
      const response = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      toast({
        title: "Password reset successful",
        description: "Your password has been reset successfully",
      });

      router.push("/auth/login");
    } catch (error) {
      toast({
        title: "Error resetting password",
        variant: "destructive",
        description: "Please try again later",
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-background">
      <div className="w-full bg-transparent p-8">
        <div className="mb-8 grid gap-4">
          <div className="grid">
            <h1 className="text-2xl font-bold">Reset Password 🔐</h1>
            <p className="text-muted-foreground">
              Enter your new password below to reset your account
            </p>
          </div>
        </div>

        <Form {...resetPasswordForm}>
          <form
            onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}
            className="space-y-6"
          >
            <FormField
              control={resetPasswordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter new password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  {!showPassword ? (
                    <EyeIcon
                      size={20}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-4 -translate-y-1/2 text-gray-400"
                    />
                  ) : (
                    <EyeOffIcon
                      size={20}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-4 -translate-y-1/2 text-gray-400"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={resetPasswordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Confirm new password"
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  {!showConfirmPassword ? (
                    <EyeIcon
                      size={20}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-4 -translate-y-1/2 text-gray-400"
                    />
                  ) : (
                    <EyeOffIcon
                      size={20}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-4 -translate-y-1/2 text-gray-400"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full rounded-full">
              Reset Password
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <Link
            href="/auth/login"
            className="text-muted-foreground hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
