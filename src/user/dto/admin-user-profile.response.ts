import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { TransactionType } from 'src/enums/transaction-type.enum';

export class AdminUserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  username: string;
  joinDate: string;
  lastLogin: string;
  walletid: string;
  balance: number;
  lastTranstactionAt: string;
  transactionCount: number;
  transactionValue: number;
}

export class GetTransactionsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sort?: 'ASC' | 'DESC';

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
