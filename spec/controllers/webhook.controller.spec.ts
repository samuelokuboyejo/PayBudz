import { TestingModule, Test } from '@nestjs/testing';
import { WebhookController } from 'src/controllers/webhook.controller';
import { PaystackService } from 'src/services/paystack.service';
import { WebhookService } from 'src/services/webhook.service';
import { Request, Response } from 'express';

describe('WebhookController', () => {
  let controller: WebhookController;
  let service: jest.Mocked<WebhookService>;
  let paystackService: jest.Mocked<PaystackService>;

  beforeEach(async () => {
    const mockWebhookService = {
      handlePaystackWebhook: jest.fn().mockResolvedValue({ status: 'ok' }),
    };

    const mockPaystackService = {
      initiateTopUp: jest.fn(),
      handlePaystackWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: WebhookService,
          useValue: mockWebhookService,
        },
        { provide: PaystackService, useValue: mockPaystackService },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
    service = module.get(WebhookService) as jest.Mocked<WebhookService>;
    paystackService = module.get(
      PaystackService,
    ) as jest.Mocked<PaystackService>;
  });

  describe('handleWebhook', () => {
    it('should call webhookService.handlePaystackWebhook and respond with 200', async () => {
      const mockReq: Partial<Request> = {};
      const mockRes: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await controller.handleWebhook(mockReq as Request, mockRes as Response);

      expect(service.handlePaystackWebhook).toHaveBeenCalledWith(mockReq);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith('ok');
    });
  });
});
