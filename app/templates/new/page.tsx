"use client";

import { TemplateEditor } from "@/components/templates/template-editor";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
export default function NewTemplatePage() {
  const router = useRouter();
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ←
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">New Template</h1>
      </div>
      <TemplateEditor templateId="new" />
    </div>
  );
}
