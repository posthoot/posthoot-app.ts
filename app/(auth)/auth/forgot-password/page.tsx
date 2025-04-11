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
    <div className="flex items-center justify-center bg-transparent w-full md:w-1/2 mx-auto">
      <div className="w-full bg-transparent p-8">
        <div className="mb-8 grid gap-4">
          <div className="grid">
            <h1 className="text-4xl text-center font-normal text-primary-foreground">
              Forgot Password 🫡
            </h1>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleForgotPassword)}
                className="space-y-6 mx-auto w-[300px] mt-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
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
