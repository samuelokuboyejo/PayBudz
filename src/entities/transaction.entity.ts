import { TransactionStatus } from 'src/enums/transaction-status.enum';
import { TransactionType } from 'src/enums/transaction-type.enum';
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('transactions')
@Unique(['walletId', 'idempotencyKey'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId: string;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'currency', length: 3 })
  currency: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    enumName: 'transaction_status',
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({
    type: 'enum',
    enumName: 'transaction_type',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({name: 'idempotency_key'})
  idempotencyKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  idempotencyKey: string | null;
}
