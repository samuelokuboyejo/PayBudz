/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from './wallet.module';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionModule } from './transaction.module';
import { TransferModule } from './transfer.module';
import { Transfer } from 'src/entities/transfer.entity';
import { UserModule } from 'src/modules/user.module';
import { AppService } from 'src/services/app.service';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';
import { AppController } from 'src/controllers/app.controller';
import { User } from 'src/entities/user.entity';
import { AuthModule } from 'src/modules/auth.module';
import { MailModule } from './mail.module';
import { NotificationModule } from './notification.module';
import { SlackNotificationModule } from './slack-notification.module';
import { CustomMigrationService } from 'src/migrations/custom.migrations';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Wallet, Transaction, Transfer, User],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl:
          configService.get('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),
    WalletModule,
    TransactionModule,
    TransferModule,
    UserModule,
    AuthModule,
    MailModule,
    NotificationModule,
    SlackNotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService, CustomMigrationService, FirebaseAuthGuard],
})
export class AppModule {}
