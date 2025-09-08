import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import { TransactionService } from 'src/services/transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @Get('history')
  @ApiOperation({
    summary: 'Get my transaction history for a specific currency',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by transaction status',
  })
  @ApiQuery({
    name: 'currency',
    required: false,
    enum: SupportedCurrencies,
    description: 'Filter by currency',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort by creation date',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  async getTransactions(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('currency') currency?: SupportedCurrencies,
    @Query('sort') sort?: 'ASC' | 'DESC',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const walletId = req.user.wallets[currency];

    return this.transactionService.findTransactions(
      walletId,
      status,
      currency,
      sort,
      page,
      limit,
    );
  }
}
