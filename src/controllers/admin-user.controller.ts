import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminUserService } from '../services/admin-user.service';
import {
  AdminUserProfileResponse,
  GetTransactionsQueryDto,
} from 'src/user/dto/admin-user-profile.response';
import { Wallet } from 'src/entities/wallet.entity';
import { Transaction } from 'src/entities/transaction.entity';

@ApiTags('User Management')
@Controller('admin/users')
// @UseGuards(AdminAuthGuard)
export class AdminUserController {
  constructor(private adminUserService: AdminUserService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search for a user by query string (name, email, etc.)',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
  })
  async searchUser(
    @Query('query') query: string,
  ): Promise<AdminUserProfileResponse> {
    return this.adminUserService.searchUser(query);
  }

  @ApiOperation({ summary: 'Deactivate a user wallet' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user' })
  @Patch(':id/deactivate')
  async deactivateWallet(@Param('id') userId: string): Promise<Wallet> {
    const wallet = await this.adminUserService.deactivateUserWallet(userId);
    return wallet;
  }

  @ApiOperation({ summary: 'Reactivate a user wallet' })
  @ApiParam({ name: 'id', type: String, description: 'The user Id' })
  @Patch(':id/reactivate')
  async activateWallet(@Param('id') userId: string): Promise<Wallet> {
    const wallet = await this.adminUserService.reactivateUserWallet(userId);
    return wallet;
  }

  @Get(':id/transactions')
  @ApiOperation({
    summary: 'Get transactions for a specific user with optional filters',
  })
  @ApiParam({ name: 'id', type: String, description: 'The user Id' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by transaction status',
  })
  @ApiQuery({
    name: 'currency',
    required: false,
    type: String,
    description: 'Filter by transaction currency',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['DEBIT', 'CREDIT'],
    description: 'Filter by transaction type',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Start date filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'End date filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
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
    description: 'Number of transactions per page',
  })
  async getUserTransactions(
    @Param('id') userId: string,
    @Query() query: GetTransactionsQueryDto,
  ): Promise<Transaction[]> {
    const options = {
      userId,
      status: query.status,
      currency: query.currency,
      type: query.type,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      sort: query.sort || 'DESC',
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
    };

    return this.adminUserService.getTransactions(options);
  }
}
