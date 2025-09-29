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
import { TopUpDto } from 'src/dto/topup.dto';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';
import { WalletCashoutDto } from 'src/dto/wallet-cashout.dto';

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
  @ApiOperation({ summary: 'Initiate wallet top-up and return a payment link' })
  @ApiResponse({ status: 201, description: 'Payment link created.' })
  async initiateTopUp(@Req() req: any, @Body() dto: TopUpDto) {
    const userId = req.user.id;
    const email = req.user.email;
    return this.walletService.getTopupPaymentLink(
      userId,
      dto.amount,
      dto.currency,
      email,
    );
  }

  @Post('cashout')
  @ApiBody({ type: WalletCashoutDto })
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Initiate wallet Cash-out' })
  async createCashout(@Req() req: any, @Body() dto: WalletCashoutDto) {
    const userId = req.user.uid;
    return this.walletService.initiateCashout(userId, dto);
  }
}
