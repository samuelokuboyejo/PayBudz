import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserProfileResponse } from 'src/user/dto/user-profile-response';
import { UsernameResponse } from 'src/dto/username-response';
import { UsernameAvailabilityResponse } from 'src/dto/username-availability-response';
import { SupportedCurrencies } from 'src/enums/currency.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getProfile(email: string): Promise<UserProfileResponse> {
    const user = await this.findByEmail(email);
    const response: UserProfileResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      isVerified: user.isVerified,
      wallets: user.wallets || null,
      createdAt: user.createdAt,
    };

    return response;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUsername(
    userId: string,
    newUsername: string,
  ): Promise<UsernameResponse> {
    const lowerUsername = newUsername.toLowerCase();

    const { available } = await this.checkUsernameAvailability(lowerUsername);
    if (!available) {
      throw new ConflictException('Username is not available');
    }

    await this.userRepository.update(userId, { username: lowerUsername });

    const updatedUser = await this.userRepository.findOneByOrFail({
      id: userId,
    });

    return {
      id: updatedUser.id,
      username: updatedUser.username,
    };
  }

  async checkUsernameAvailability(
    username: string,
  ): Promise<UsernameAvailabilityResponse> {
    const lowerUsername = username.toLowerCase();
    const reserved = new Set(['admin', 'username', 'administrator']);
    if (reserved.has(lowerUsername)) {
      return { available: false };
    }

    const exists = await this.userRepository.exists({
      where: { username: lowerUsername },
    });

    return { available: !exists };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // async findByWalletId(walletId: string): Promise<User> {
  //   return this.userRepository
  //     .createQueryBuilder('user')
  //     .where(`user.wallets @> :wallet`, {
  //       wallet: JSON.stringify({ NGN: walletId }),
  //     })
  //     .getOne();
  // }

  async findByWalletId(walletId: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where(
        `EXISTS (
      SELECT 1
      FROM jsonb_each_text(user.wallets) AS w(currency, id)
      WHERE w.id = :walletId
    )`,
        { walletId },
      )
      .getOne();
  }

  async getUserWallets(
    email: string,
  ): Promise<Partial<Record<SupportedCurrencies, string>> | null> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    return user.wallets || null;
  }
}
