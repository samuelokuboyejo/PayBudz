import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from '../../src/services/firebase.service';

const mockVerifyIdToken = jest.fn();

jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    auth: jest.fn(() => ({
      verifyIdToken: mockVerifyIdToken,
    })),
  };
});
describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseService],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call verifyIdToken and return decoded token', async () => {
    const mockToken = 'mock-token';
    const mockDecodedToken = { uid: '123', email: 'test@example.com' };
    mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

    const result = await service.verifyIdToken(mockToken);

    expect(mockVerifyIdToken).toHaveBeenCalledWith(mockToken);
    expect(result).toEqual(mockDecodedToken);
  });
});
