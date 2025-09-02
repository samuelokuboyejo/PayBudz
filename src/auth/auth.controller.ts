import { Body, Controller, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthResponse } from './dto/auth-response';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a user using Firebase ID token' })
  async signUp(@Body('idToken') idToken: string): Promise<AuthResponse> {
    return this.authService.signUp(idToken);
  }

  @Post('refresh-auth')
  @ApiOperation({ summary: 'Refresh authentication token' })
  refreshAuth(@Query('refreshToken') refreshToken: string) {
    return this.authService.refreshAuthToken(refreshToken);
  }
}
