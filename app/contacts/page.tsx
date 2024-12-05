import { ContactsList } from "@/components/contacts/contacts-list";
import { ContactsHeader } from "@/components/contacts/contacts-header";

export default function ContactsPage() {
  return (
    <div className="p-8 space-y-8">
      <ContactsHeader />
      <ContactsList />
    </div>
  );
}