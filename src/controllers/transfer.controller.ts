import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';
import { TransferDto } from 'src/dto/transfer.dto';
import { TransferService } from 'src/services/transfer.service';

@ApiTags('Transfers')
@Controller('transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @ApiBody({ type: TransferDto })
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Transfer funds to another user by username' })
  @Post()
  async transfer(@Body() dto: TransferDto, @Req() req: any) {
    const sourceUserId = req.user.id;
    return this.transferService.transfer(sourceUserId, dto);
  }
}
