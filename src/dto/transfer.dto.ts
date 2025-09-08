import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { SupportedCurrencies } from 'src/enums/currency.enum';

export class TransferDto {
  @ApiProperty({
    description: 'The username of the destination user receiving the funds',
    example: 'sammy123',
  })
  @IsString()
  destinationUsername: string;

  @ApiProperty({
    description: 'The amount to be transferred',
    example: '5000',
  })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    description:
      'An idempotency key to ensure the same request is not processed twice',
    example: 'abc123-xyz789',
  })
  @IsString()
  idempotencyKey: string;

  @ApiProperty({
    description: 'Currency of the transfer',
    example: 'NGN',
  })
  @IsString()
  currency: SupportedCurrencies;
}
