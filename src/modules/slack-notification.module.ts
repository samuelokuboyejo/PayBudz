import { Module } from '@nestjs/common';
import { SlackNotificationService } from 'src/services/slack-notification.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SlackNotificationService],
  exports: [SlackNotificationService],
})
export class SlackNotificationModule {}
