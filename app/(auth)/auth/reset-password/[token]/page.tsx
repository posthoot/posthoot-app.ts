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
import { toast } from "@/hooks/use-toast";
import React, { use, useState } from "react";
import { EyeIcon } from "lucide-react";
import { EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <div className="relative z-[9999] w-96 gap-8 p-8 text-center">
      <div className="EntryScreen_logo__qjIqU">
        <img
          alt=""
          loading="lazy"
          width="24"
          height="24"
          decoding="async"
          data-nimg="1"
          className="Image_image__5RgVm Image_loaded__qmdFe"
          src="/assets/star.svg"
        />
      </div>
      <span className="text-3xl font-sentient text-gray-500">
        Hey 👋🏻, <br />
        Reset Password
      </span>
      <Form {...resetPasswordForm}>
        <form
          className="mt-8"
          onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}
        >
          <FormField
            control={resetPasswordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem className="my-4 relative">
                <FormControl>
                  <Input
                    placeholder="Enter new password"
                    className="Field_input__1L5wD h-[50px]"
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
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={resetPasswordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="my-4 relative">
                <FormControl>
                  <Input
                    placeholder="Confirm new password"
                    className="Field_input__1L5wD h-[50px]"
                    type={showConfirmPassword ? "text" : "password"}
                    {...field}
                  />
                </FormControl>
                {!showConfirmPassword ? (
                  <EyeIcon
                    size={20}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-4 -translate-y-1/2 text-gray-400"
                  />
                ) : (
                  <EyeOffIcon
                    size={20}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-4 -translate-y-1/2 text-gray-400"
                  />
                )}
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <button className="button w-full" type="submit">
            Reset Password
          </button>
        </form>
      </Form>
    </div>
  );
}
