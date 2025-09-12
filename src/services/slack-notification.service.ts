import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class SlackNotificationService {
  private logger = new Logger(SlackNotificationService.name);
  private slackClient: AxiosInstance;
  private webhookUrl: string;

  constructor(private configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>('SLACK_WEBHOOK_URL', '');

    if (!this.webhookUrl) {
      this.logger.error(
        'SLACK_WEBHOOK_URL is not set in the environment variables.',
      );
    }

    this.slackClient = axios.create({
      baseURL: this.webhookUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async sendMessage(title: string, details: string): Promise<boolean> {
    if (!this.webhookUrl) {
      this.logger.error('Cannot send Slack message: missing webhook URL.');
      return false;
    }

    const payload = {
      text: `*${title}*\n${details}`,
    };

    try {
      await this.slackClient.post('', payload);
      this.logger.log(`Slack message sent: ${title}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send Slack message: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
