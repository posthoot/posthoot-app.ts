"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { EmailCategory, EmailTemplate, TemplateEditorProps } from "@/types";
import { useTeam } from "@/app/providers/team-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Mail, Send } from "lucide-react";
import { deepCompare } from "@/lib/utils";

const testEmailSchema = z.object({
  email: z.string().email(),
});

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const emailEditorRef = useRef<EditorRef | null>(null);
  const { team } = useTeam();

  const [template, setTemplate] = useState<EmailTemplate>({
    id: "",
    name: "",
    subject: "",
    variables: [],
    teamId: team?.id || "some-team-id",
    html: "",
    design: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    categoryId: "Transactional",
    designJson: "",
  });
  const [activeTab, setActiveTab] = useState("settings");
  const [emailCategories, setEmailCategories] = useState<EmailCategory[]>([]);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);

  const getEmailCategories = async () => {
    try {
      const response = await fetch("/api/email-category");
      const data = await response.json();
      setEmailCategories(data.data);
      if (template.categoryId === "Transactional") {
        template.categoryId = data.data[0].id;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch email categories",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    getEmailCategories();
    if (templateId !== "new") {
      fetchTemplate();
    }
  }, [templateId]);

  const onReady: EmailEditorProps["onReady"] = (unlayer) => {
    if (templateId !== "new" && template.design) {
      try {
        unlayer?.loadDesign(template.design as any);
      } catch (error) {
        console.error("Failed to load template design:", error);
      }
    }
  };

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      const data = await response.json();
      console.log("data", data);
      setTemplate(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive",
      });
    }
  };

  const templateCategories = emailCategories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const selectedCategory = templateCategories.find(
    (category) => category.value === template.categoryId
  );

  const handleSave = async () => {
    try {
      const unlayer = emailEditorRef.current?.editor;
      unlayer?.exportHtml(async (data) => {
        const { html, design } = data;

        const updatedTemplate = {
          ...template,
          html: html,
          designJson: design,
          changed: !deepCompare(template.designJson, design),
          categoryId: selectedCategory?.value,
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

  const sendTestEmail = async (email: string) => {
    setIsSendingTestEmail(true);
    emailEditorRef.current?.editor?.exportHtml(async ({ html }) => {
      const response = await fetch(`/api/email`, {
        method: "POST",
        body: JSON.stringify({
          email,
          html,
          test: true,
        }),
      });

      setIsSendingTestEmail(false);

      if (!response.ok) {
        throw new Error("Failed to send test email");
      }

      toast({
        title: "Success",
        description: "Test email sent successfully",
      });
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(testEmailSchema),
  });

  const onSubmit = (data: { email: string }) => {
    sendTestEmail(data.email);
    setShowTestEmailDialog(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Design
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowTestEmailDialog(true)}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSendingTestEmail ? "Sending..." : "Send Test"}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>Save Template</Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Save Template</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to save this template? This will
                      overwrite any existing template with the same name.
                    </DialogDescription>
                  </DialogHeader>
                  <Button onClick={handleSave}>Save Template</Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {
            <Dialog
              open={showTestEmailDialog}
              onOpenChange={setShowTestEmailDialog}
            >
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Send Test Email</DialogTitle>
                </DialogHeader>
                <form
                  className="flex flex-col space-y-4"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <Input
                    name="email"
                    required
                    type="email"
                    placeholder="Email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <span className="text-red-500">
                      {errors.email.message as string}
                    </span>
                  )}
                  {isSendingTestEmail ? (
                    <Button type="submit" disabled>
                      Sending...
                    </Button>
                  ) : (
                    <Button type="submit">Send</Button>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          }

          <div className="flex-1 overflow-hidden">
            <TabsContent value="settings" className="h-full">
              <div className="max-w-2xl mx-auto p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={template.name}
                    onChange={(e) =>
                      setTemplate({ ...template, name: e.target.value })
                    }
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={template.subject}
                    onChange={(e) =>
                      setTemplate({ ...template, subject: e.target.value })
                    }
                    placeholder="Enter email subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailCategory">Email Category</Label>
                  <Select
                    value={selectedCategory?.value}
                    onValueChange={(value) =>
                      setTemplate({ ...template, categoryId: value })
                    }
                    defaultValue={selectedCategory?.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="h-full">
              <div className="h-full">
                <EmailEditor
                  ref={emailEditorRef}
                  onReady={onReady}
                  options={{
                    locale: "en",
                  }}
                  minHeight="calc(100vh - 120px)"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
