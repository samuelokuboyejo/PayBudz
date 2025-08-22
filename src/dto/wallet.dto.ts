/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SupportedCurrencies } from 'src/enums/currency.enum';

export class CreateWalletDto {
  @IsEnum(SupportedCurrencies, { message: 'currency not supported.' })
  @ApiProperty({ enum: SupportedCurrencies })
  currency: SupportedCurrencies;
}
