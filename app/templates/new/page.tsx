import { TemplateEditor } from "@/components/templates/template-editor";
import { PageHeader } from "@/components/page-header";
export default function NewTemplatePage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Create New Template"
        description="Create a new email template and preview the result"
      />
      <div className="px-4">
        <TemplateEditor templateId="new" />
      </div>
    </div>
  );
}
