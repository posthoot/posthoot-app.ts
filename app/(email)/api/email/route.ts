import { APIService } from "@/lib/services/api";
import { logger } from "@/app/lib/logger";
import { z } from "zod";
import { NextResponse } from "next/server";
import { isEmpty, removeUndefined } from "@/lib/utils";
import { auth } from "@/auth";
import { EmailTemplate } from "@/lib";

// Response interfaces
interface SendEmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Request interfaces
interface SendEmailRequest {
  email: string;
  html?: string;
  templateId?: string;
  subject: string;
  provider?: string;
  data?: Record<string, any>;
  cc?: string[];
  bcc?: string[];
}

const FILE_NAME = "app/(email)/api/email/route.ts";

const zodSchema = z.object({
  email: z.string().email(),
  html: z.string().optional(),
  templateId: z.string().optional(),
  provider: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
  test: z.boolean().optional(),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
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
export async function POST(
  request: Request
): Promise<NextResponse<SendEmailResponse | { error: string }>> {
  try {
    console.log("🔍", "Starting email send process");
    logger.info({
      fileName: FILE_NAME,
      emoji: "🔍",
      action: "initialize",
      label: "email",
      value: {},
      message: "Starting email send process",
    });

    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "email",
        value: {},
        message: "Unauthorized access attempt",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiService = new APIService("emails", session);

    logger.info({
      fileName: FILE_NAME,
      emoji: "🔍",
      action: "parse",
      label: "email_request",
      value: { userId: session.user.id },
      message: "Parsing email request body",
    });

    const body = (await request.json()) as SendEmailRequest;
    let {
      email,
      html,
      provider = undefined,
      data = {},
      test = false,
      cc = undefined,
      bcc = undefined,
    } = zodSchema.parse(body);

    if (isEmpty(html)) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "validate",
        label: "email",
        value: {},
        message: "Missing HTML content",
      });
      return new NextResponse("Missing required fields", { status: 400 });
    }

    logger.info({
      fileName: FILE_NAME,
      emoji: "🔍",
      action: "fetch",
      label: "smtp_config",
      value: provider,
      message: "Fetching SMTP configuration",
    });

    try {
      const result = await apiService.post(
        "",
        removeUndefined({
          to: email,
          html,
          provider,
          data,
          test,
          cc,
          bcc,
        })
      );
      return new NextResponse(JSON.stringify(result), { status: 200 });
    } catch (error) {
      console.error(
        `File name: route.ts, ❌, line no: 10, function name: handler, variable name: error, value: ${error}`
      );
      return new NextResponse("Failed to send email due to: " + error, {
        status: 400,
      });
    }
  } catch (error) {
    console.error(
      `File name: route.ts, ❌, line no: 10, function name: handler, variable name: error, value: ${error}`
    );
    return new NextResponse("Failed to send email due to: " + error, {
      status: 400,
    });
  }
}
