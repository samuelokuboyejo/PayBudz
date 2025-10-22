import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminAnalyticsResponse } from 'src/dto/admin-analytics-response';
import { NewUsersResponse } from 'src/dto/new-users-response';
import { TransactionVolumeResponse } from 'src/dto/transaction-volume-response';
import { UserTransactionStats } from 'src/entities/user-transaction-stats.entity';
import { AdminAnalyticsService } from 'src/services/admin-analytics-service';

@ApiTags('Admin')
@Controller('admin')
// @UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get overall analytics summary' })
  async getAnalytics(): Promise<AdminAnalyticsResponse> {
    return this.adminAnalyticsService.getAnalytics();
  }

  @Get('charts/transactions')
  @ApiOperation({ summary: 'Get transaction volume over time' })
  async getTransactionVolume(): Promise<TransactionVolumeResponse[]> {
    return this.adminAnalyticsService.getTransactionVolumeOverTime();
  }

  @Get('charts/new-users')
  @ApiOperation({ summary: 'Get new users over time' })
  async getNewUsers(): Promise<NewUsersResponse[]> {
    return this.adminAnalyticsService.getNewUsersOverTime();
  }

  @Get('charts/top-users')
  @ApiOperation({ summary: 'Get top users by transaction value' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of users to return (default: 10)',
  })
  async getTopUsers(
    @Query('limit') limit = 10,
  ): Promise<UserTransactionStats[]> {
    return this.adminAnalyticsService.getTopUsersByTransactionValue(limit);
  }
}
