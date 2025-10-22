import { TransactionType } from 'src/enums/transaction-type.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class TransactionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({
    type: 'enum',
    enumName: 'transaction_type',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'varchar' })
  currency: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'idempotency_key' })
  idempotencyKey: string;
}
