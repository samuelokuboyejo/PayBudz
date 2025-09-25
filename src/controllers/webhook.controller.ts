import { Controller, Post, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhookService } from 'src/services/webhook.service';
import { Request, Response } from 'express';

@ApiTags('webhook')
@Controller('webhooks')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}
  @Post('paystack')
  @ApiOperation({ summary: 'Handle webhooks' })
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    await this.webhookService.handlePaystackWebhook(req);
    return res.status(200).send('ok');
  }
}
