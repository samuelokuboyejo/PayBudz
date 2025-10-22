import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class UserTransactionStats {
  @PrimaryColumn()
  userId: string;

  @Column({ type: 'bigint', default: 0 })
  totalCredit: number;

  @Column({ type: 'bigint', default: 0 })
  totalDebit: number;

  @Column({ type: 'bigint', default: 0 })
  totalVolume: number;
}
