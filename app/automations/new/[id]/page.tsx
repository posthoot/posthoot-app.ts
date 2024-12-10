import React from "react";
import EmailFlowBuilderWrapper from "@/components/emailFlowBuilder";

interface AutomationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AutomationPage({ params }: AutomationPageProps) {
  const { id } = React.use(params);

  return (
    <div className="h-screen px-6 w-full bg-background grid grid-cols-1">
      <div className="container mx-auto py-4 grid gap-4 grid-rows-[auto_1fr]">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold">New Automation Flow</h1>
          <p className="text-muted-foreground">
            ID: {id}
          </p>
        </div>
        
        <div className="h-full w-full rounded-lg border">
          <EmailFlowBuilderWrapper />
        </div>
      </div>
    </div>
  );
} 