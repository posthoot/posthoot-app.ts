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
  data: z.record(z.string(), z.any()).optional(),
});

/**
 * @openapi
 * /api/email:
 *   post:
 *     summary: Send an email
 *     tags: [Email]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - subject
 *               - provider
 *               - teamId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               html:
 *                 type: string
 *               templateId:
 *                 type: string
 *               subject:
 *                 type: string
 *               provider:
 *                 type: string
 *               teamId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request - Invalid email configuration
 *       500:
 *         description: Internal Server Error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    let { email, html, templateId, subject, provider, teamId, data } =
      zodSchema.parse(body);

    if (isEmpty(templateId) && isEmpty(html)) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const emailSmtpConfig = await getEmailSmtpConfig(teamId, provider);

    if (!isEmpty(templateId)) {
      const template = await getEmailTemplate(templateId, data);
      html = template.html;
      subject = subject || template.subject;
    }

    const subscriber = await getSubscriber(email, teamId, null, "Generic List");

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
