import emailService from "@/lib/services/email";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getEmailSmtpConfig, getEmailTemplate } from "@/app/lib/smtp";
import { isEmpty } from "@/lib/utils";
import { getSubscriber } from "@/lib/services/email/subscriber";

const zodSchema = z.object({
  email: z.string().email(),
  html: z.string().optional(),
  templateId: z.string().optional(),
  subject: z.string(),
  provider: z.string(),
  teamId: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let { email, html, templateId, subject, provider, teamId } =
      zodSchema.parse(body);

    if (isEmpty(templateId) && isEmpty(html)) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const emailSmtpConfig = await getEmailSmtpConfig(provider, teamId);

    if (!isEmpty(templateId)) {
      const template = await getEmailTemplate(templateId);
      html = template.html;
      subject = subject || template.subject;
    }

    const subscriber = await getSubscriber(email, teamId);

    try {
      const result = await emailService.sendEmail(
        email,
        html,
        subject,
        emailSmtpConfig.host,
        parseInt(emailSmtpConfig.port),
        emailSmtpConfig.username,
        emailSmtpConfig.password,
        emailSmtpConfig.username,
        [],
        teamId,
        subscriber.id,
        null,
        templateId
      );
      console.log(
        `File name: route.ts, 📧, line no: 10, function name: handler, variable name: result, value: ${result}`
      );
      return new NextResponse(JSON.stringify(result), { status: 200 });
    } catch (error) {
      console.error(
        `File name: route.ts, ❌, line no: 10, function name: handler, variable name: error, value: ${error}`
      );
      return new NextResponse("Failed to send email", { status: 500 });
    }
  } catch (error) {
    console.error(
      `File name: route.ts, ❌, line no: 10, function name: handler, variable name: error, value: ${error}`
    );
    return new NextResponse("Failed to send email", { status: 500 });
  }
}
