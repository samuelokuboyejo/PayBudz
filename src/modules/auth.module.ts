import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { FirebaseModule } from 'src/modules/firebase.module';
import { WalletModule } from 'src/modules/wallet.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from 'src/controllers/auth.controller';
import { AuthService } from 'src/services/auth.service';
import { NotificationModule } from './notification.module';
import { SlackNotificationModule } from './slack-notification.module';
import { AdminAnalyticsModule } from './admin-analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRE_IN'),
        },
      }),
    }),
    FirebaseModule,
    WalletModule,
    HttpModule,
    NotificationModule,
    SlackNotificationModule,
    AdminAnalyticsModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
