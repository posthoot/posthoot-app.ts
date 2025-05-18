import { IMAPEmail } from "@/app/api/imap/emails/route";
import { Mail } from "@/app/types";

export const parsedMailFrom = (mail: Mail | IMAPEmail) => {
  if (mail) {
    const emailRegex = /<([^>]+)>/;
    const match = mail.from.match(emailRegex);
    const name = mail.from.split(" ")[0];
    return match ? `${name.replace(/[^\w\s]/g, "")} <${match[1]}>` : mail.from;
  }
  return null;
};
