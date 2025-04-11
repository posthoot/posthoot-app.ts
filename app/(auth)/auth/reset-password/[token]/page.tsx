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
import { toast } from "sonner";
import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react";

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

      toast.success("Password reset successful", {
        description: "Your password has been reset successfully",
      });

      router.push("/auth/login");
    } catch (error) {
      toast.error("Error resetting password", {
        description: "Please try again later",
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-transparent w-full md:w-1/2 mx-auto">
      <div className="w-full bg-transparent p-8">
        <div className="mb-8 grid gap-4">
          <div className="grid">
            <h1 className="text-4xl text-center font-normal text-primary-foreground">
              Reset Password 🔐
            </h1>
            <Form {...resetPasswordForm}>
              <form
                onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}
                className="space-y-6 mx-auto w-[300px] mt-4"
              >
                <FormField
                  control={resetPasswordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter new password"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="!rounded-xl !border-none"
                        />
                      </FormControl>
                      <div
                        className="absolute right-2 top-1 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {!showPassword ? (
                          <EyeIcon
                            size={20}
                            className="text-muted-foreground"
                          />
                        ) : (
                          <EyeOffIcon
                            size={20}
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={resetPasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Confirm new password"
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                          className="!rounded-xl !border-none"
                        />
                      </FormControl>
                      <FormMessage />
                      <div
                        className="absolute right-2 top-1 cursor-pointer"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {!showConfirmPassword ? (
                          <EyeIcon
                            size={20}
                            className="text-muted-foreground"
                          />
                        ) : (
                          <EyeOffIcon
                            size={20}
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <div className="flex items-center justify-center w-[300px] mx-auto gap-4 mt-2">
              <Link
                className="text-left text-primary-foreground w-full hover:underline"
                href={"/auth/login"}
              >
                login
              </Link>
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
