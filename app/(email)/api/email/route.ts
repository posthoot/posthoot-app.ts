import emailService from "@/lib/services/email";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getEmailSmtpConfig, getEmailTemplate } from "@/app/lib/smtp";
import { isEmpty } from "@/lib/utils";
import { getSubscriber } from "@/lib/services/email/subscriber";
import prisma from "@/app/lib/prisma";
import { auth } from "@/auth";

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
 *       - ApiKeyAuth: [
 *         type: apiKey
 *         in: header
 *         name: x-api-key
 *       ]
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
 *               - data
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
 *               data:
 *                 type: object
 *                 description: Data to be used in the email template
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request - Invalid email configuration
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal Server Error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await auth();

    const team = await prisma.team.findFirst({
      where: {
        users: {
          some: {
            id: session?.user.id,
          },
        },
      },
    });

    if (!team) {
      return new NextResponse("Team not found", { status: 404 });
    }

    const teamId = team.id;

    let { email, html, templateId, subject, provider, data } =
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
