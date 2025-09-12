/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SlackNotificationService } from 'src/services/slack-notification.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SlackNotificationService', () => {
  let service: SlackNotificationService;
  let configService: ConfigService;
  let postMock: jest.Mock;

  beforeEach(async () => {
    postMock = jest.fn();
    mockedAxios.create.mockReturnValue({ post: postMock } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackNotificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockReturnValue('https://hooks.slack.com/services/...'),
          },
        },
      ],
    }).compile();

    service = module.get<SlackNotificationService>(SlackNotificationService);
    configService = module.get<ConfigService>(ConfigService);
    service['logger'] = { error: () => {}, log: () => {} } as any;
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a Slack message successfully', async () => {
    postMock.mockResolvedValueOnce({ status: 200 });

    const result = await service.sendMessage('Test Title', 'Test Details');

    expect(postMock).toHaveBeenCalledWith('', {
      text: `*Test Title*\nTest Details`,
    });
    expect(result).toBe(true);
  });

  it('should return false if webhook URL is missing', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackNotificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(''),
          },
        },
      ],
    }).compile();

    const serviceWithoutUrl = module.get<SlackNotificationService>(
      SlackNotificationService,
    );

    jest
      .spyOn(serviceWithoutUrl['logger'], 'error')
      .mockImplementation(() => {});
    jest.spyOn(serviceWithoutUrl['logger'], 'log').mockImplementation(() => {});

    const result = await serviceWithoutUrl.sendMessage(
      'Test Title',
      'Test Details',
    );
    expect(result).toBe(false);
  });

  it('should return false when Slack API call fails', async () => {
    postMock.mockRejectedValueOnce(new Error('Slack API error'));

    const result = await service.sendMessage('Test Title', 'Test Details');
    expect(result).toBe(false);
  });
});
