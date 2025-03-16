"use client";

import { ContactImport } from "@/components/contacts/contact-import";
import { ContactsList } from "@/components/contacts/contacts-list";
import { PageHeader } from "@/components/page-header";
import { useParams } from "next/navigation";

export default function ContactListPage() {
  const { listId } = useParams();

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Contacts"
        description="Manage contacts in this list"
        backButton={{
          href: "/audience/lists",
          label: "Back to lists",
        }}
      >
        <ContactImport listId={listId as string} onImportComplete={() => {}} />
      </PageHeader>
      <div className="px-8">
        <ContactsList listId={listId as string} />
      </div>
    </div>
  );
}
