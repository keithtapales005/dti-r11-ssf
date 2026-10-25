import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    this.from = this.config.get<string>('MAIL_FROM') ?? user ?? '';
    this.frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      this.transporter = null;
      this.logger.warn('SMTP is not configured; emails will not be sent.');
    }
  }

  // Returns true if sent. Never throws, so a mail problem can't break approval.
  async sendAccountApproved(
    to: string,
    firstName: string,
    username: string,
  ): Promise<boolean> {
    if (!this.transporter) return false;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Your SSF account has been approved',
        text:
          `Hello ${firstName},\n\n` +
          `Your account (${username}) for the DTI Region XI Shared Service ` +
          `Facilities File Management System has been approved. ` +
          `You can now sign in here:\n\n` +
          `${this.frontendUrl}/login-page\n\n` +
          `This is an automated message. Please do not reply.`,
      });
      return true;
    } catch (err) {
      this.logger.error('Failed to send approval email', err as Error);
      return false;
    }
  }

    async sendAccountRejected(
    to: string,
    firstName: string,
    reason: string,
  ): Promise<boolean> {
    if (!this.transporter) return false;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Your SSF registration was not approved',
        text:
          `Hello ${firstName},\n\n` +
          `Your registration for the DTI Region XI Shared Service ` +
          `Facilities File Management System has been rejected due to ` +
          `the following reasons:\n\n` +
          `${reason}\n\n` +
          `If you have questions, please contact the DTI Region XI office.\n\n` +
          `This is an automated message. Please do not reply.`,
      });
      return true;
    } catch (err) {
      this.logger.error('Failed to send rejection email', err as Error);
      return false;
    }
  }
}