"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string; code: string }>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const { error, code } = use(searchParams);

  const { data: session } = useSession();

  useEffect(() => {
    if (error === "CredentialsSignin" && code === "credentials") {
      setShowError(true);
      // Clear the URL parameters
      router.replace("/auth/login");
    }
  }, [error, code, router]);

  if (session) {
    redirect("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
  };

  return (
    <div className="flex w-full items-center justify-center bg-background">
      <div className="w-full bg-transparent p-8">
        <div className="mb-8 grid gap-4">
          <div className="grid">
            <h1 className="text-3xl font-bold">Welcome back 👋🏻!</h1>
            <p className="text-muted-foreground">
              Posthoot - Your email, your way.
            </p>
          </div>
        </div>
        {showError && (
          <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
            Invalid email or password. Please try again.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" variant="default" className="w-full  ">
            Sign in
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link
            href="/auth/forgot-password"
            className="text-muted-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-foreground hover:underline"
            >
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
