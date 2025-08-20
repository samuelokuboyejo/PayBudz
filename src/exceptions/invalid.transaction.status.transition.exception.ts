import { BadRequestException } from '@nestjs/common';
import { TransactionStatus } from '../enums/transaction-status.enum';

export class InvalidTransactionStatusTransitionException extends BadRequestException {
  constructor(from: TransactionStatus, to: TransactionStatus) {
    super(`Invalid transaction status transition: ${from} → ${to}`);
  }
}
