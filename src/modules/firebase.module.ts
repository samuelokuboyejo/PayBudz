import { Module } from '@nestjs/common';
import { FirebaseService } from 'src/services/firebase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
