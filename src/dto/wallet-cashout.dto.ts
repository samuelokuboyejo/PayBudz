import { IsNumber, IsNotEmpty, IsString } from 'class-validator';
import { SupportedCurrencies } from 'src/enums/currency.enum';

export class WalletCashoutDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: SupportedCurrencies;

  @IsString()
  @IsNotEmpty()
  bankAccountNumber: string;

  @IsString()
  @IsNotEmpty()
  bankCode: string;
}
