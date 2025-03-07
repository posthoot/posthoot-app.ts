"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
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
import Image from "next/image";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const loginFormScheam = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const loginForm = useForm<z.infer<typeof loginFormScheam>>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
    resolver: zodResolver(loginFormScheam),
  });

  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  if (session) {
    redirect("/");
  }

  const handleLogin = async (data: z.infer<typeof loginFormScheam>) => {
    return await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: true,
      callbackUrl: "/",
    });
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
        Welcome Back
      </span>
      <Form {...loginForm}>
        <form className="mt-8" onSubmit={loginForm.handleSubmit(handleLogin)}>
          <FormField
            control={loginForm.control}
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
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={loginForm.control}
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
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <button className="button w-full" type="submit">
            Login
          </button>
        </form>
      </Form>
      <div className="flex flex-col gap-2 mt-4">
        <Link
          href="/auth/forgot-password"
          className="text-sm font-sans hover:underline text-gray-400"
        >
          Forgot Password?
        </Link>
        <Link
          href="/auth/register"
          className="text-sm font-sans hover:underline text-gray-400"
        >
          Don't have an account? Register
        </Link>
      </div>
    </div>
  );
}
