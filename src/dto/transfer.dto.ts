import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class TransferDto {
  @ApiProperty({
    description: 'The ID of the wallet initiating the transfer',
    example: '274f773e-c3cc-42c1-8875-ddc0477e7426',
  })
  @IsUUID()
  sourceWalletId: string;

  @ApiProperty({
    description: 'The ID of the destination wallet receiving the funds',
    example: 'd4fffee7-27c3-485f-a5d3-fc0279fcaa6a',
  })
  @IsUUID()
  destinationWalletId: string;

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
}
