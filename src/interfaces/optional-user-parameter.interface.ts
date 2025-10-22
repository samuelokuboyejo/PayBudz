import { TransactionType } from 'src/enums/transaction-type.enum';

export interface GetUserProfileOptions {
  walletId?: string;
  userId?: string;
  email?: string;
  username?: string;
}

export interface FindTransactionsOptions {
  userId: string;
  status?: string;
  currency?: string;
  type?: TransactionType;
  fromDate?: Date;
  toDate?: Date;
  sort?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
