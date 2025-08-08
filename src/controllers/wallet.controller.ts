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
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { WalletService } from '../services/wallet.service';
import {
  CreateWalletDto,
} from '../dto/wallet.dto';

@ApiTags('wallets')
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
  @ApiParam({ 
    name: 'walletId', 
    type: 'string'
  })
  async fetchWalletById(
    @Param('walletId', ParseUUIDPipe) walletId: string,
  ) {
    const wallet = await this.walletService.findWalletById(walletId);
    return wallet;
  }
}
