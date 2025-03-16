"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-full py-12">
      <div className="mb-6">
        <img
          src="https://ouch-cdn2.icons8.com/dRJPX_ejT97VIAXYL1QlivM8tx83f7_ugTdkHeXTLG4/rs:fit:570:456/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvMzA3/LzYxOWEwYmZlLTY2/YjctNGU3MS05ZjA0/LTRkYTY5ODY5MDU3/Ny5zdmc.png"
          alt="Page not found illustration"
          width={250}
          height={200}
          className="mx-auto"
        />
      </div>
      <span className="text-4xl font-semibold">Oops! Sorry</span>
      <p className="text-muted-foreground text-center mb-4">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="default">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
