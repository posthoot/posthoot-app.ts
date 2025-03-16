"use client";
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
import { useState } from "react";
import { EyeOffIcon } from "lucide-react";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  if (session) {
    redirect("/");
  }

  const handleRegister = async (data: z.infer<typeof registerFormSchema>) => {
    // Handle registration logic here
    // For example, call an API to register the user
    console.log("Registering user:", data);
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
    <div className="flex items-center justify-center bg-background">
      <div className="w-full bg-transparent p-8">
        <div className="mb-8 grid gap-4">
          <div className="grid">
            <h1 className="text-2xl font-bold">Create an account 🎉</h1>
            <p className="text-muted-foreground">
              Enter your details below to create your account
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleRegister)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
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
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
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
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Confirm your password"
                      type="password"
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
              Create account
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-foreground hover:underline"
            >
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
