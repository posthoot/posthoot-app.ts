"use client";

import { MailingListProvider } from "@/app/providers/mailinglist-provider";
import { ContactLists } from "@/components/contacts/contact-lists";

export default function ContactListsPage() {
  return (
    <MailingListProvider>
      <ContactLists />
    </MailingListProvider>
  );
}
