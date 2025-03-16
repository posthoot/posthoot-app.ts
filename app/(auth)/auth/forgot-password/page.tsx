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

export default function ForgotPasswordPage() {
  // 🔐 Form schema for forgot password
  const forgotPasswordSchema = z.object({
    email: z.string().email(),
  });

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
    resolver: zodResolver(forgotPasswordSchema),
  });

  // 📧 Handle forgot password submission
  const handleForgotPassword = async (
    data: z.infer<typeof forgotPasswordSchema>
  ) => {
    // TODO: Implement forgot password logic
    console.log("Reset password for:", data.email);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log(result);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions",
      });
    } catch (error) {
      toast({
        title: "Error sending reset email",
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
            <h1 className="text-2xl font-bold">Forgot Password 🫡</h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleForgotPassword)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full rounded-full">
              Send Reset Link
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
