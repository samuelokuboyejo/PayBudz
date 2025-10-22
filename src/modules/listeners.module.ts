// listeners.module.ts
import { Module } from '@nestjs/common';
import { NotificationListener } from 'src/listeners/notification.listener';
import { AnalyticsListener } from 'src/listeners/analytics.listener';
import { SlackNotificationModule } from './slack-notification.module';
import { WalletModule } from './wallet.module';
import { NotificationModule } from './notification.module';
import { AdminAnalyticsModule } from './admin-analytics.module';

@Module({
  imports: [
    SlackNotificationModule,
    WalletModule,
    NotificationModule,
    AdminAnalyticsModule,
  ],
  providers: [NotificationListener, AnalyticsListener],
})
export class ListenersModule {}
