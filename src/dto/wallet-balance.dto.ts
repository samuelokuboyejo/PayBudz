/* eslint-disable prettier/prettier */
import { SupportedCurrencies } from 'src/enums/currency.enum';

export class WalletBalanceDto {
  walletId: string;
  availableBalance: number;
  currency: SupportedCurrencies;
}
