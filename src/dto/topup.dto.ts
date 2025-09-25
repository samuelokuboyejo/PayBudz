import { IsEmail, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { SupportedCurrencies } from 'src/enums/currency.enum';

export class TopUpDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(SupportedCurrencies)
  currency: SupportedCurrencies;

  @IsEmail()
  email: string;
}
