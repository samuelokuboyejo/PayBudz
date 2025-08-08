import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from '../services/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    return {
      success: true,
      message: 'Wallet service is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
