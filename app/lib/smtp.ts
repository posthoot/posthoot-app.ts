import { prisma } from "./prisma";

export const getEmailSmtpConfig = async (provider: string, teamId: string) => {
  const emailSmtpConfig = await prisma.smtpConfig.findFirst({
    where: {
      provider,
      team: {
        id: teamId,
      },
    },
  });
  return emailSmtpConfig;
};

const getEmailTemplateHTML = async (blobUrl: string) => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  const text = await blob.text();
  return text;
};

export const getEmailTemplate = async (templateId: string) => {
  const emailTemplate = await prisma.emailTemplate.findFirst({
    where: {
      id: templateId,
    },
  });

  if (!emailTemplate) {
    throw new Error("Email template not found");
  }

  const emailTemplateHTML = await getEmailTemplateHTML(emailTemplate.html);

  emailTemplate.html = emailTemplateHTML;

  return emailTemplate;
};
