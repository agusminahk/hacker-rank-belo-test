import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Transaction, TransactionStatus } from '@domain/model/transaction.entity';

@Entity({ name: 'transaction' })
export class TransactionPersistence {
  @PrimaryColumn()
  id: string;

  @Column()
  fromUserId: string;

  @Column()
  toUserId: string;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toDomain(): Transaction {
    return Transaction.createExisting({
      id: this.id,
      fromUserId: this.fromUserId,
      toUserId: this.toUserId,
      amount: Number(this.amount),
      status: this.status as TransactionStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  static fromDomain(transaction: Transaction): TransactionPersistence {
    const persistence = new TransactionPersistence();
    persistence.id = transaction.id;
    persistence.fromUserId = transaction.fromUserId;
    persistence.toUserId = transaction.toUserId;
    persistence.amount = transaction.amount;
    persistence.status = transaction.status;
    persistence.createdAt = transaction.createdAt;
    persistence.updatedAt = transaction.updatedAt;
    return persistence;
  }
}
