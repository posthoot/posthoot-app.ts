import { Cleo } from "@cleotasks/core";
import { Attachment } from "nodemailer/lib/mailer";
import { sendMail } from "nodemailer-mail-tracking";
import nodemailer from "nodemailer";
import { MailTrackOptions } from "nodemailer-mail-tracking/dist/types";
import { prisma } from "@/app/lib/prisma";
import { createJwtFromSecret, removeUndefined } from "../utils";
import { logger } from "@/app/lib/logger";
import { getEmailSmtpConfig, getEmailTemplate } from "@/app/lib/smtp";
import { getSubscriber } from "./email/subscriber";
const cleo = Cleo.getInstance();

cleo.configure({
  redis: {
    host: process.env.CLEO_REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB),
  },
  worker: {
    concurrency: 3,
  },
});

class EmailService {
  @cleo.task({
    id: "sendEmail",
    retries: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  })
  async sendEmail(
    email: string,
    html: string,
    subject: string,
    smtpHost: string,
    smtpPort: number,
    smtpUser: string,
    smtpPass: string,
    smtpFrom: string,
    attachments?: Attachment[],
    teamId?: string,
    subscriberId?: string,
    campaignId?: string,
    templateId?: string
  ) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const sentEmail = await prisma.sentEmail.create({
      data: removeUndefined({
        recipient: email,
        subject: subject,
        content: html,
        team: teamId
          ? {
              connect: {
                id: teamId,
              },
            }
          : undefined,
        subscriber: subscriberId
          ? {
              connect: {
                id: subscriberId,
              },
            }
          : undefined,
        campaign: campaignId
          ? {
              connect: {
                id: campaignId,
              },
            }
          : undefined,
        template: templateId
          ? {
              connect: {
                id: templateId,
              },
            }
          : undefined,
      }),
    });

    logger.info({
      fileName: "email.ts",
      message: "Sent email to " + email + " with subject " + subject,
      value: {
        sentEmailId: sentEmail.id,
        email: email,
        subject: subject,
      },
      emoji: "📧",
      action: "sendEmail",
      label: "Sent email to " + email + " with subject " + subject,
    });

    const mailTrackingOptions: MailTrackOptions = {
      baseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/email/track/${sentEmail.id}`,
      getData: async (data) => {
        return {
          ...data,
          sentEmailId: sentEmail.id,
        };
      },
      jwtSecret: process.env.JWT_SECRET,
      onLinkClick: async ({ sentEmailId }) => {},
      onBlankImageView: async ({ sentEmailId }) => {},
    };

    const mailOptions = {
      from: smtpFrom,
      to: email,
      subject: subject,
      html: html,
      attachments: attachments,
    };

    try {
      await sendMail(mailTrackingOptions, transporter, mailOptions);
    } catch (error) {
      console.error(
        `File name: email.ts, ❌, line no: 20, function name: sendTestEmail, variable name: error, value: ${error}`
      );
      throw new Error("Failed to send email");
    }

    return {
      success: true,
    };
  }

  async sendInvitationEmail(
    email: string,
    subject: string,
    teamId: string,
    templateId: string,
    providerId?: string | null,
    data?: Record<string, any>
  ) {
    const provider = await getEmailSmtpConfig(teamId, providerId);
    const emailTemplate = await getEmailTemplate(templateId, data);

    await this.sendEmail(
      email,
      emailTemplate.html,
      subject ?? emailTemplate.subject,
      provider.host,
      parseInt(provider.port),
      provider.username,
      provider.password,
      provider.username,
      [],
      teamId,
      (
        await getSubscriber(email, teamId, null, "Team Invites")
      ).id,
      null,
      templateId
    );
  }
}

const emailService = new EmailService();

export default emailService;
export { cleo };
