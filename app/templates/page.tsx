import { TemplatesList } from "@/components/templates/templates-list";
import { TemplatesHeader } from "@/components/templates/templates-header";

export default function TemplatesPage() {
  return (
    <div className="p-8 space-y-8">
      <TemplatesHeader />
      <TemplatesList />
    </div>
  );
} 