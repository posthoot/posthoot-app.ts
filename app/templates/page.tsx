'use client';
import { TemplatesList } from "@/components/templates/templates-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useRouter } from "next/navigation";
export default function TemplatesPage() {
  const router = useRouter();
  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Templates"
        description="Manage your email templates and preview the result"
      >
        <Button onClick={() => router.push("/templates/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </PageHeader>
      <div className="px-4">
        <TemplatesList />
      </div>
    </div>
  );
}
