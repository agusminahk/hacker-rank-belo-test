import crypto from 'crypto';

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export interface CreateTransactionInput {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export class Transaction {
  private constructor(
    readonly id: string,
    readonly fromUserId: string,
    readonly toUserId: string,
    readonly amount: number,
    readonly status: TransactionStatus,
    readonly createdAt: Date = new Date(),
    readonly updatedAt: Date = new Date()
  ) {}

  public static create(input: CreateTransactionInput): Transaction {
    const id = crypto.randomUUID();
    return new Transaction(id, input.fromUserId, input.toUserId, input.amount, TransactionStatus.PENDING);
  }
}
