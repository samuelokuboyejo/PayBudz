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
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { WalletService } from '../services/wallet.service';
import { CreateWalletDto } from '../dto/wallet.dto';
import { Wallet } from 'src/entities/wallet.entity';
import { WalletBalanceDto } from 'src/dto/wallet-balance.dto';
import { PaystackService } from 'src/services/paystack.service';
import { TopUpDto } from 'src/dto/topup.dto';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('wallets')
@Controller('wallets')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paystackService: PaystackService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWallet(@Body() createWalletDto: CreateWalletDto) {
    const wallet = await this.walletService.createWallet(createWalletDto);
    return wallet;
  }

  @Get(':walletId')
  @ApiParam({
    name: 'walletId',
    type: 'string',
  })
  async fetchWalletById(@Param('walletId', ParseUUIDPipe) walletId: string) {
    const wallet = await this.walletService.findWalletById(walletId);
    return wallet;
  }

  @ApiParam({
    name: 'walletId',
    type: 'string',
    required: true,
  })
  @Put(':walletId/activate')
  async activateWallet(@Param('walletId') walletId: string): Promise<Wallet> {
    const wallet = await this.walletService.activateWallet(walletId);
    return wallet;
  }

  @ApiParam({
    name: 'walletId',
    type: 'string',
    required: true,
  })
  @Put(':walletId/deactivate')
  async deactivateWallet(@Param('walletId') walletId: string): Promise<Wallet> {
    const wallet = await this.walletService.deactivateWallet(walletId);
    return wallet;
  }

  @ApiParam({
    name: 'walletId',
    type: 'string',
    required: true,
  })
  @Get(':walletId/balance')
  async getWalletBalance(
    @Param('walletId') walletId: string,
  ): Promise<WalletBalanceDto> {
    const balance = await this.walletService.getWalletBalance(walletId);
    return balance;
  }

  @Post('topup')
  @ApiBody({ type: TopUpDto })
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Initiate wallet top-up' })
  @ApiResponse({ status: 201, description: 'Payment link created.' })
  async initiateTopUp(@Req() req: any, @Body() dto: TopUpDto) {
    const user = req.user;
    return this.paystackService.initiateTopUp(
      user,
      dto.amount,
      dto.currency,
      dto.email,
    );
  }
}
