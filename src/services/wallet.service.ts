/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { CreateWalletDto } from '../dto/wallet.dto';
import { WalletBalanceDto } from 'src/dto/wallet-balance.dto';
import { SupportedCurrencies } from '../enums/currency.enum';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionStatus } from 'src/enums/transaction-status.enum';
import { TransactionType } from 'src/enums/transaction-type.enum';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,

    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

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
    wallet.updatedAt = new Date();
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
    wallet.updatedAt = new Date();
    return this.walletRepository.save(wallet);
  }

  async getWalletBalance(walletId: string): Promise<WalletBalanceDto> {
    const wallet = await this.findWalletById(walletId);
    const [row] = await this.dataSource.query(
      `SELECT * FROM wallet_balances WHERE wallet_id = $1`,
      [walletId],
    );

    const availableBalance = Number(row?.balance || 0);
    return {
      walletId,
      availableBalance,
      currency: wallet.currency as SupportedCurrencies,
    };
  }

  async addDummyTransaction(walletId: string) {
    // Step 1: Create transaction as PENDING
    const dummy = this.transactionRepository.create({
      walletId: walletId,
      type: TransactionType.DEBIT,
      amount: 500,
      status: TransactionStatus.SUCCESSFUL,
      currency: 'NGN',
      metadata: { test: true },
    });

    const balance = await this.transactionRepository.save(dummy);
    return balance;
  }
}
