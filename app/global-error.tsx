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
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-full py-12">
      <div className="mb-6">
        <img
          src="https://ouch-cdn2.icons8.com/4QALLVYyfmhsvooj66mKvnovu8oIJfS1qdxTPdiyGoE/rs:fit:456:456/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvMjU2/L2RhMTFkMzJiLWJk/NGQtNDBhZC1hMDhj/LTEwMjI0NjYyODQz/Zi5zdmc.png"
          alt="Page not found illustration"
          width={250}
          height={200}
          className="mx-auto"
        />
      </div>
      <p className="text-muted-foreground text-center mb-6">
        {error.message}
      </p>
      <div className="flex gap-4">
        <Button asChild variant="default">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
