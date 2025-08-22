import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'transfers' })
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromWalletId: string;

  @Column()
  toWalletId: string;

  @Column({ type: 'numeric' })
  amount: number;

  @Column()
  currencyCode: string;

  @Column({ unique: true })
  idempotencyKey: string;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  debitTransactionId: string;

  @Column()
  creditTransactionId: string;
}
