"use client";

import { useState } from "react";
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
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { EyeOffIcon, MailIcon } from "lucide-react";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/icon/GoogleIcon";

export default function RegisterPage() {
  const registerFormSchema = z
    .object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      password: z.string().min(8),
      confirmPassword: z.string().min(8),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof registerFormSchema>>({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    resolver: zodResolver(registerFormSchema),
  });

  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailRegister, setShowEmailRegister] = useState(false);

  if (session) {
    redirect("/");
  }

  const handleRegister = async (data: z.infer<typeof registerFormSchema>) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Registration failed");
      }
      toast({
        title: "Registration successful",
        description: "Please check your email for verification",
      });
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration error",
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
              hey 👋🏻, welcome to posthoot
            </h1>
            <div className="text-center">
              <div
                className="cursor-pointer flex mx-auto justify-center items-center w-[200px] !rounded-xl border border-white bg-primary-foreground gap-2 px-5 py-2 mt-8"
                onClick={() => signIn("google")}
              >
                <GoogleIcon />
                <span>Sign up with Google</span>
              </div>
            </div>

            <div className="mx-auto w-[300px] mt-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleRegister)}
                  className="space-y-4"
                >
                  <div className="grid gap-2 grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Enter your first name"
                              {...field}
                              className="!rounded-xl !border-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Enter your last name"
                              {...field}
                              className="!rounded-xl !border-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormControl>
                          <Input
                            placeholder="Enter your password"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormControl>
                          <Input
                            placeholder="Confirm your password"
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                            className="!rounded-xl !border-none"
                          />
                        </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="text-right text-primary-foreground w-full">
                  press ⏎ to confirm
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
