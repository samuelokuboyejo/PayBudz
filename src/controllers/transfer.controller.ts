import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransferDto } from 'src/dto/transfer.dto';
import { TransferService } from 'src/services/transfer.service';

@ApiTags('Transfers')
@Controller('transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @ApiOperation({ summary: 'Initiate a transfer between wallets' })
  @ApiBody({ type: TransferDto })
  async transfer(@Body() dto: TransferDto) {
    const transaction = await this.transferService.transfer(dto);
    return transaction;
  }
}
