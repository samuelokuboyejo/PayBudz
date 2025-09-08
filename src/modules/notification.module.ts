import { Module } from '@nestjs/common';
import { NotificationService } from 'src/services/notification.service';
import { MailModule } from './mail.module';

@Module({
  imports: [MailModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
