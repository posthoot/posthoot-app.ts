"use client";
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
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";
import { EyeOffIcon } from "lucide-react";
import { EyeIcon } from "lucide-react";

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

  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
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
        Create an Account
      </span>
      <Form {...registerForm}>
        <form
          className="mt-8"
          onSubmit={registerForm.handleSubmit(handleRegister)}
        >
          <FormField
            control={registerForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormControl>
                  <Input
                    placeholder="First Name"
                    className="Field_input__1L5wD h-[50px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={registerForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormControl>
                  <Input
                    placeholder="Last Name"
                    className="Field_input__1L5wD h-[50px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={registerForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormControl>
                  <Input
                    placeholder="Email"
                    className="Field_input__1L5wD h-[50px]"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={registerForm.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mb-4 relative">
                <FormControl>
                  <Input
                    placeholder="Password"
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={registerForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="mb-4 relative">
                <FormControl>
                  <Input
                    placeholder="Confirm Password"
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
                <FormMessage />
              </FormItem>
            )}
          />
          <button className="button w-full" type="submit">
            Register
          </button>
        </form>
      </Form>
      <div className="flex flex-col gap-2 mt-4">
        <Link
          href="/auth/login"
          className="text-sm hover:underline text-gray-400"
        >
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
}
