import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { WalletCashoutIntent } from 'src/entities/wallet-cashout-intent.entity';
import { WalletTopUpIntent } from 'src/entities/wallet-topup-intent.entity';
import { PaystackService } from 'src/services/paystack.service';
import { SlackNotificationService } from 'src/services/slack-notification.service';
import { MailModule } from './mail.module';
import { NotificationModule } from './notification.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletTopUpIntent, WalletCashoutIntent, User]),
    HttpModule,
    MailModule,
    NotificationModule,
  ],
  providers: [PaystackService, SlackNotificationService],
  exports: [PaystackService],
})
export class PaymentModule {}
