/* eslint-disable prettier/prettier */
// src/wallet/dto/create-wallet.dto.ts
import { IsIn, IsString, Length } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';


// todo: maybe export this or keep this in external config
const supportedCurrencies = ['EUR', 'NGN', 'USD'];

export class CreateWalletDto {
  @IsString()
  @IsIn(supportedCurrencies, {
    message: "currency not supported by wallet-service"
  })
  @ApiProperty()
  currency: string;
}
