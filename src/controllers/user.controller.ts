import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';
import { UserProfileResponse } from '../user/dto/user-profile-response';
import { UserService } from 'src/services/user.service';
import { UsernameResponse } from 'src/dto/username-response';
import { UsernameAvailabilityResponse } from 'src/dto/username-availability-response';
import { CheckUsernameDto } from 'src/dto/check-username-dto';
import { UserNameUpdateRequestDTO } from 'src/dto/username-update-request';
import { User } from 'src/entities/user.entity';

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

  @Get('username-availability')
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkAvailability(
    @Query() query: CheckUsernameDto,
  ): Promise<UsernameAvailabilityResponse> {
    return this.userService.checkUsernameAvailability(query.username);
  }

  @Patch(':id/username')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUsername(
    @Param('id') userId: string,
    @Body() dto: UserNameUpdateRequestDTO,
  ): Promise<UsernameResponse> {
    return this.userService.updateUsername(userId, dto.username);
  }

  @Get(':walletId')
  @ApiOperation({ summary: 'Find user by wallet ID' })
  async findByWalletId(@Param('walletId') walletId: string): Promise<User> {
    return this.userService.findByWalletId(walletId);
  }
}
