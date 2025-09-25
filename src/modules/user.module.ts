import { Module } from '@nestjs/common';
import { UserService } from 'src/services/user.service';
import { UserController } from '../controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { FirebaseModule } from 'src/modules/firebase.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FirebaseModule, HttpModule],

  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
