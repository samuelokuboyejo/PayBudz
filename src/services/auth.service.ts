import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { FirebaseService } from 'src/services/firebase.service';
import { AuthResponse } from '../dto/auth-response';
import { ConfigService } from '@nestjs/config';
import { AuthProvider } from 'src/enums/auth-provider.enum';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import { WalletService } from 'src/services/wallet.service';
import { User } from 'src/entities/user.entity';
import { DataSource } from 'typeorm';
import { DecodedToken } from 'src/interfaces/decoded-token.interface';
import { AuthJwtPayload } from 'src/auth/types/auth-jwtPayload';
import { NotificationService } from './notification.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    private httpService: HttpService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
    private walletService: WalletService,
    private notificationService: NotificationService,
  ) {}

  async signUp(idToken: string): Promise<AuthResponse> {
    const decodedToken = await this.firebaseService.verifyIdToken(idToken);

    if (!decodedToken.email) {
      throw new UnauthorizedException('Email not found in token');
    }

    const user = await this.signUpWithProvider(decodedToken);

    try {
      const emailResult = await this.notificationService.sendWelcomeEmail(
        user.email,
        user.firstName,
      );
      this.logger.log(
        `Welcome email sent to ${user.email}. Result: ${JSON.stringify(
          emailResult,
        )}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}: ${err.message}`,
        err.stack,
      );
    }

    return this.generateTokens(user.id, user.email);
  }

  async refreshAuthToken(refreshToken: string): Promise<{
    idToken: string;
    refreshToken: string;
    expiresIn: string | number;
  }> {
    try {
      const {
        id_token: idToken,
        refresh_token: newRefreshToken,
        expires_in: expiresIn,
      } = await this.sendRefreshAuthTokenRequest(refreshToken);
      return {
        idToken,
        refreshToken: newRefreshToken,
        expiresIn,
      };
    } catch (error: any) {
      if (error.message.includes('INVALID_REFRESH_TOKEN')) {
        throw new Error(`Invalid refresh token: ${refreshToken}.`);
      } else {
        throw new Error('Failed to refresh token');
      }
    }
  }

  private async sendRefreshAuthTokenRequest(refreshToken: string): Promise<{
    id_token: string;
    refresh_token: string;
    expires_in: string | number;
  }> {
    const apiKey = this.configService.get<string>('APIKEY');
    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    try {
      const response$ = this.httpService.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      throw new UnauthorizedException(
        error.response?.data || 'Auth request failed',
      );
    }
  }

  private generateTokens(userId: string, email: string): AuthResponse {
    const payload: AuthJwtPayload = {
      sub: userId,
      email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRE_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async signUpWithProvider(decodedToken: DecodedToken): Promise<User> {
    const authProvider =
      (decodedToken.firebase.sign_in_provider?.toLowerCase() as AuthProvider) ??
      AuthProvider.GOOGLE;

    return await this.dataSource.transaction(async (manager) => {
      let user = await manager.findOne(User, {
        where: { email: decodedToken.email },
      });

      if (!user) {
        const fullName = decodedToken.name?.split(' ') || ['Unknown', 'User'];
        const authProviderMap: Partial<Record<AuthProvider, string>> = {
          [authProvider]: decodedToken.uid,
        };
        user = manager.create(User, {
          email: decodedToken.email,
          firstName: fullName[0],
          lastName: fullName.slice(1).join(' ') || 'User',
          username: decodedToken.email, // we're setting the email as the default username
          isVerified: decodedToken.email_verified ?? false,
          authProvider: authProviderMap,
          firebaseUid: decodedToken.uid,
        });
        await manager.save(user);

        const defaultWallet = await this.walletService.createWallet({
          currency: SupportedCurrencies.NGN,
        });

        user.wallets = {
          [defaultWallet.currency]: defaultWallet.id,
        };
        await manager.save(user);
      }
      return user;
    });
  }
}
