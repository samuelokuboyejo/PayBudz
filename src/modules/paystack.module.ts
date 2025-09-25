import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTopUpIntent } from 'src/entities/wallet-topup-intent.entity';
import { NotificationService } from 'src/services/notification.service';
import { PaystackService } from 'src/services/paystack.service';
import { SlackNotificationService } from 'src/services/slack-notification.service';
import { WalletModule } from './wallet.module';
import { MailModule } from './mail.module';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletTopUpIntent, User]),
    forwardRef(() => WalletModule),
    MailModule,
  ],
  providers: [PaystackService, NotificationService, SlackNotificationService],
  exports: [PaystackService],
})
export class PaystackModule {}
