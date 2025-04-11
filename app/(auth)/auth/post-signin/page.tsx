"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PostSignin() {
  const { update } = useSession();
  const router = useRouter();
  // read search params
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  useEffect(() => {
    update({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
    router.push("/");
  }, []);
}