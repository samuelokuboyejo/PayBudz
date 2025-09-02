import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';
import { UserProfileResponse } from './dto/user-profile-response';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async getProfile(@Req() request: any): Promise<UserProfileResponse> {
    const firebaseUser = request.user;
    return this.userService.getProfile(firebaseUser.email);
  }
}
