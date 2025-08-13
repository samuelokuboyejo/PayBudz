/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
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
import { Wallet } from 'src/entities/wallet.entity';


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

  @ApiParam({ 
    name: 'walletId', 
    type: 'string'
  })
@Put(':id/activate')
  async activateWallet(@Param('id') walletId: string): Promise<Wallet>{
    const wallet = await this.walletService.activateWallet(walletId)
    return wallet;
  }

@ApiParam({ 
    name: 'walletId', 
    type: 'string'
  }) 
@Put('{}:id/deactivate')
  async deactivateWallet(@Param('id') walletId: string): Promise<Wallet>{
    const wallet = await this.walletService.deactivateWallet(walletId)
    return wallet;
  }
}
