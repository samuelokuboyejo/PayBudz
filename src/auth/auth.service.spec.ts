import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from 'src/services/firebase.service';
import { WalletService } from 'src/services/wallet.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { DataSource } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let firebaseService: FirebaseService;
  let jwtService: JwtService;
  let walletService: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: { verifyIdToken: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(() => 'signed-token') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => 'value') },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((fn) =>
              fn({
                findOne: jest.fn(() => null),
                create: jest.fn((cls, data) => data),
                save: jest.fn((data) => data),
              }),
            ),
          },
        },
        {
          provide: WalletService,
          useValue: {
            createWallet: jest.fn(() => ({ id: 'wallet-id', currency: 'NGN' })),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(() =>
              of({
                data: {
                  id_token: 'id',
                  refresh_token: 'ref',
                  expires_in: 3600,
                },
              }),
            ),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    jwtService = module.get<JwtService>(JwtService);
    walletService = module.get<WalletService>(WalletService);
  });

  it('should sign up a user with Firebase and return access and refresh tokens', async () => {
    (firebaseService.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: '123',
      email: 'test@gmail.com',
      email_verified: true,
      name: 'Eric George',
      firebase: { sign_in_provider: 'google.com' },
    });

    const result = await authService.signUp('mock-id-token');
    expect(result).toEqual({
      accessToken: 'signed-token',
      refreshToken: 'signed-token',
    });
  });

  it('should throw UnauthorizedException if token has no email address', async () => {
    (firebaseService.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: '123',
      firebase: { sign_in_provider: 'google.com' },
    });

    await expect(authService.signUp('mock-id-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should refresh auth token', async () => {
    const result = await authService.refreshAuthToken('refresh-token');
    expect(result).toEqual({
      idToken: 'id',
      refreshToken: 'ref',
      expiresIn: 3600,
    });
  });

  it('should create a user and automatically assign a wallet', async () => {
    const decodedToken = {
      uid: '123',
      email: 'user@gmail.com',
      email_verified: true,
      name: 'Eric Maxwell',
      firebase: { sign_in_provider: 'google.com' },
    };

    const user = await authService.signUpWithProvider(decodedToken);

    expect(user.email).toBe('user@gmail.com');
    expect(user.firstName).toBe('Eric');
    expect(user.lastName).toBe('Maxwell');
    expect(user.wallets).toEqual({ NGN: 'wallet-id' });
  });
});
