import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import {
  CreateWalletDto,
} from '../dto/wallet.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWallet(@Body() createWalletDto: CreateWalletDto) {
    const wallet = await this.walletService.createWallet(createWalletDto);
    return wallet;
  }

  @Get(':walletId')
  async fetchWalletById(
    @Param('walletId', ParseUUIDPipe) walletId: string,
  ) {
    const wallet = await this.walletService.findWalletById(walletId);
    return wallet;
  }
}
