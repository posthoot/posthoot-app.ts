import { TemplateEditor } from "@/components/templates/template-editor";

export default function NewTemplatePage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create New Template</h1>
        <p className="text-muted-foreground">
          Create a new email template and preview the result
        </p>
      </div>
      <TemplateEditor templateId="new" />
    </div>
  );
} 