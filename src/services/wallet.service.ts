/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource,} from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { CreateWalletDto, } from '../dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private dataSource: DataSource,
  ) { }

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletRepository.create({
      currency: createWalletDto.currency,
      isActive: false,
    });

    return await this.walletRepository.save(wallet);
  }

  async findWalletById(walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }


  async activateWallet(walletId: string): Promise<Wallet> {
    const wallet = await this.findWalletById(walletId);

    if (!wallet) {
      throw new NotFoundException('Wallet with id found');
    }

    if (wallet.isActive) {
      throw new BadRequestException('Wallet already active');
    }

    wallet.isActive = true;
    return this.walletRepository.save(wallet);
  }

  async deactivateWallet(walletId: string): Promise<Wallet> {
    const wallet = await this.findWalletById(walletId);

    if (!wallet) {
      throw new NotFoundException('Wallet with id found');
    }

    if (!wallet.isActive) {
      throw new BadRequestException('Wallet already inactive');
    }

    wallet.isActive = false;
    return this.walletRepository.save(wallet);
  }


 
}
