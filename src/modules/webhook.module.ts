import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookController } from 'src/controllers/webhook.controller';
import { WalletTopUpIntent } from 'src/entities/wallet-topup-intent.entity';
import { PaystackService } from 'src/services/paystack.service';
import { WebhookService } from 'src/services/webhook.service';
import { WalletModule } from './wallet.module';
import { User } from 'src/entities/user.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([WalletTopUpIntent]),
    TypeOrmModule.forFeature([User]),
    WalletModule,
    HttpModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService, PaystackService],
  exports: [WebhookService],
})
export class WebhookModule {}
