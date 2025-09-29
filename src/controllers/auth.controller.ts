import { Body, Controller, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthResponse } from '../dto/auth-response';
import { AuthService } from 'src/services/auth.service';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a user using Firebase ID token' })
  async signUp(
    @Body('idToken') idToken: string,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    return this.authService.signUp(idToken, req);
  }

  @Post('refresh-auth')
  @ApiOperation({ summary: 'Refresh authentication token' })
  refreshAuth(@Query('refreshToken') refreshToken: string) {
    return this.authService.refreshAuthToken(refreshToken);
  }
}
