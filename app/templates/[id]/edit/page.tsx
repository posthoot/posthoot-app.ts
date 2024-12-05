import { TemplateEditor } from "@/components/templates/template-editor";

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Template</h1>
        <p className="text-muted-foreground">
          Edit your email template and preview the result
        </p>
      </div>
      <TemplateEditor templateId={params.id} />
    </div>
  );
} 