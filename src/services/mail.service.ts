import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { MailTemplate } from 'src/mail/templates/types';
import { render } from '@react-email/render';

@Injectable()
export class MailService {
  private resend: Resend;
  private logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async sendMail<T>(
    to: string,
    template: MailTemplate<T>,
    data: T,
    failSilently = false,
  ) {
    try {
      const html = await render(template.render(data));
      const fromName = this.configService.get<string>('EMAIL_FROM');
      const fromEmail = this.configService.get<string>('EMAIL_DOMAIN');

      const response = await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject: template.subject,
        html,
      });

      this.logger.log(
        `Email sent to ${to}. Response: ${JSON.stringify(response)}`,
      );

      return response;
    } catch (error: any) {
      this.logger.error(
        `Failed to send email to ${to}: ${error.message}`,
        error.stack,
      );

      if (failSilently) {
        this.logger.warn(`Giving up sending email to ${to}.`);
      }

      throw error;
    }
  }
}
