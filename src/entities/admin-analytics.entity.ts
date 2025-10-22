import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AdminAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', default: 0 })
  totalTransactionValue: number;

  @Column({ type: 'int', default: 0 })
  totalTransactionCount: number;

  @Column({ type: 'int', default: 0 })
  totalUsers: number;

  @Column({ type: 'int', default: 0 })
  activeWallets: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTransaction: Date | null;

  @Column({ type: 'numeric', default: 0 })
  revenue: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
