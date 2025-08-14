/* eslint-disable prettier/prettier */
import { TransactionStatus } from "src/enums/transaction-status.enum";
import { TransactionType } from "src/enums/transaction-type.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name: 'wallet_id'})
    walletId: string;

    @Column({name: 'amount'})
    amount: number;

    @Column({ type: 'json', nullable: true })
    metaData?: Record<string, any>;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status: TransactionStatus;


    @Column({
        type: 'enum',
        enum: TransactionType,
    })
    type: TransactionType;

    @Column({name: 'narration'})
    narration?: string;

    @Column({name: 'reference'})
    reference: string;

   @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

}
