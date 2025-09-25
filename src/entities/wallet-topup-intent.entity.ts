import { SupportedCurrencies } from 'src/enums/currency.enum';
import { TopUpStatus } from 'src/enums/topup-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'wallet_topup_intents' })
export class WalletTopUpIntent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ name: 'currency', length: 3 })
  currency: SupportedCurrencies;

  @Column({
    type: 'enum',
    enum: TopUpStatus,
    enumName: 'topup_status',
    default: TopUpStatus.PENDING,
  })
  status: TopUpStatus;

  @Column({
    name: 'paystack_reference',
  })
  paystackReference: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true, name: 'webhook_payload' })
  webhookPayload: Record<string, any> | null;
}
