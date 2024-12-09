"use client";

import { ContactsList } from "@/components/contacts/contacts-list";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ContactListPage() {
  const { listId } = useParams();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Contacts"
        description="Manage contacts in this list"
        backButton={{
          href: "/contacts/lists",
          label: "Back to lists",
        }}
      ></PageHeader>
      <div className="px-4">
        <ContactsList listId={listId as string} />
      </div>
    </div>
  );
}
