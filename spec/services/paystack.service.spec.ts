import { Test, TestingModule } from '@nestjs/testing';
import { PaystackService } from 'src/services/paystack.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';

jest.mock('axios');

describe('PaystackService', () => {
  let service: PaystackService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaystackService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'PAYSTACK_API_URL')
                return 'https://api.paystack.test';
              if (key === 'PAYSTACK_SECRET_KEY') return 'sk_test_secret';
              return null;
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              post: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PaystackService>(PaystackService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('initializePayment', () => {
    it('should call Paystack initialize API and return authorization url', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: { data: { authorization_url: 'https://paystack.test/pay' } },
      });

      const result = await service.initializePayment(
        'ref-123',
        100,
        'user@example.com',
      );

      expect(result).toBe('https://paystack.test/pay');
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.paystack.test/transaction/initialize',
        {
          amount: 100 * 100,
          email: 'user@example.com',
          reference: 'ref-123',
        },
        { headers: { Authorization: 'Bearer sk_test_secret' } },
      );
    });
  });

  describe('parseTopUpWebhook', () => {
    it('should return a parsed object with success = true', async () => {
      const payload = {
        event: 'charge.success',
        data: {
          status: 'success',
          amount: 50000,
          currency: 'NGN',
          metadata: { userId: 'user-123' },
        },
      };

      const result = await service.parseTopUpWebhook('ref-123', payload);

      expect(result.isSuccessful).toBe(true);
      expect(result.userId).toBe('user-123');
      expect(result.amount).toBe(500);
    });
  });

  describe('parseCashoutWebhook', () => {
    it('should return a parsed object with success = true', async () => {
      const payload = {
        event: 'transfer.success',
        data: {
          status: 'success',
          amount: 100000,
          currency: 'NGN',
          metadata: { userId: 'user-123' },
        },
      };

      const result = await service.parseCashoutWebhook('ref-xyz', payload);

      expect(result.isSuccessful).toBe(true);
      expect(result.amount).toBe(1000);
    });
  });

  describe('createPayout', () => {
    it('should create recipient and transfer successfully', async () => {
      (httpService.axiosRef.post as jest.Mock)
        .mockResolvedValueOnce({
          data: { data: { recipient_code: 'recipient-123' } },
        })
        .mockResolvedValueOnce({
          data: { status: 'success', reference: 'ref-123' },
        });

      const result = await service.createPayout(
        '1234567890',
        '001',
        500,
        'NGN',
        'ref-123',
      );

      expect(httpService.axiosRef.post).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ status: 'success', reference: 'ref-123' });
    });
  });
});
