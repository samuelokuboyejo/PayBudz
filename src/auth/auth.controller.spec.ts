import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            refreshAuthToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should call authService.signUp and return tokens', async () => {
    const mockIdToken = 'mock-id-token';
    const mockResponse: AuthResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    (authService.signUp as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authController.signUp(mockIdToken);

    expect(authService.signUp).toHaveBeenCalledWith(mockIdToken);
    expect(result).toEqual(mockResponse);
  });

  it('should call authService.refreshAuthToken and return new tokens', async () => {
    const mockRefreshToken = 'mock-refresh-token';
    const mockResponse = {
      idToken: 'new-id-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 3600,
    };

    (authService.refreshAuthToken as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authController.refreshAuth(mockRefreshToken);

    expect(authService.refreshAuthToken).toHaveBeenCalledWith(mockRefreshToken);
    expect(result).toEqual(mockResponse);
  });
});
