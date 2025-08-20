import { SupportedCurrencies } from 'src/enums/currency.enum';
import { TransactionType } from 'src/enums/transaction-type.enum';

export class CreateTransactionDTO {
  amount: number;
  walletId: string;
  currency: SupportedCurrencies;
  transactionType: TransactionType;
}
