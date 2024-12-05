"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { EmailTemplate } from "@/types";

interface TemplateEditorProps {
  templateId: string;
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const emailEditorRef = useRef<EditorRef | null>(null);
  const [template, setTemplate] = useState<EmailTemplate>({
    id: "",
    name: "",
    subject: "",
    content: "",
    variables: [],
    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  useEffect(() => {
    if (templateId !== "new") {
      fetchTemplate();
    }
  }, [templateId]);

  const onReady: EmailEditorProps["onReady"] = (unlayer) => {
    // Load saved design if editing existing template
    if (templateId !== "new" && template.html) {
      try {
        const design = JSON.parse(template.html);
        unlayer?.loadDesign(design);
      } catch (error) {
        console.error("Failed to load template design:", error);
      }
    }
  };

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      const data = await response.json();
      setTemplate(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      const unlayer = emailEditorRef.current?.editor;
      // Export the design from the editor
      unlayer?.exportHtml(async (data) => {
        const { design, html } = data;

        const updatedTemplate = {
          ...template,
          content: JSON.stringify(design), // Store the design JSON
          html: html, // Store the rendered HTML
        };

        const response = await fetch(
          `/api/templates/${templateId === "new" ? "" : templateId}`,
          {
            method: templateId === "new" ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTemplate),
          }
        );

        if (!response.ok) throw new Error("Failed to save template");

        toast({
          title: "Success",
          description: "Template saved successfully",
        });
        router.push("/templates");
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          className="bg-white"
          value={template.name}
          onChange={(e) => setTemplate({ ...template, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          className="bg-white"
          value={template.subject}
          onChange={(e) =>
            setTemplate({ ...template, subject: e.target.value })
          }
        />
      </div>

      <Card className="h-[700px] w-full">
        <EmailEditor ref={emailEditorRef} onReady={onReady} minHeight="650px" />
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave}>Save Template</Button>
        <Button variant="outline" onClick={() => router.push("/templates")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
