import { CashoutStatus } from 'src/enums/cashout-status.enum';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'wallet_cashout_intents' })
export class WalletCashoutIntent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ name: 'currency', length: 3 })
  currency: SupportedCurrencies;

  @Column({
    name: 'paystack_reference',
    nullable: true,
  })
  paystackReference: string;

  @Column({
    type: 'enum',
    enum: CashoutStatus,
    enumName: 'cashout_status',
    default: CashoutStatus.PENDING,
  })
  status: CashoutStatus;

  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankCode: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true, name: 'webhook_payload' })
  webhookPayload: Record<string, any> | null;
}
