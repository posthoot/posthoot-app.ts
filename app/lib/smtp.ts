import { prisma } from "./prisma";

export const getEmailSmtpConfig = async (
  teamId: string,
  provider?: string
) => {
  const emailSmtpConfig = await prisma.smtpConfig.findFirst({
    where: {
      provider: provider || undefined,
      team: {
        id: teamId,
      },
    },
  });

  if (!emailSmtpConfig) {
    throw new Error("Email SMTP config not found");
  }

  return emailSmtpConfig;
};

const getEmailTemplateHTML = async (blobUrl: string) => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  const text = await blob.text();
  return text;
};

const parseEmailVariables = (
  html: string,
  variables: { key: string; value: string }[] = []
) => {
  return html.replace(
    /{{(.*?)}}/g,
    (match, p1) =>
      variables.find((variable) => variable.key === p1)?.value || match
  );
};

export const getEmailTemplate = async (
  templateId: string,
  data: Record<string, string> = {}
) => {
  const emailTemplate = await prisma.emailTemplate.findFirst({
    where: {
      id: templateId,
    },
  });

  if (!emailTemplate) {
    throw new Error("Email template not found");
  }

  const variables = emailTemplate.variables;

  const variableValues = variables.map((variable) => ({
    key: variable,
    value: data[variable] || "",
  }));

  const emailTemplateHTML = await getEmailTemplateHTML(emailTemplate.html);

  emailTemplate.html = parseEmailVariables(emailTemplateHTML, variableValues);

  return emailTemplate;
};
