import crypto from 'node:crypto';
import { InvalidTransactionStatusError } from '@domain/errors/transaction.error';

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export interface CreateExistingTransactionInput {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionInput {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export const TRANSACTION_AUTO_APPROVE_LIMIT = 50_000;

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

  public static createExisting(input: CreateExistingTransactionInput): Transaction {
    return new Transaction(
      input.id,
      input.fromUserId,
      input.toUserId,
      input.amount,
      input.status,
      input.createdAt,
      input.updatedAt
    );
  }
  public markAsConfirmed(): Transaction {
    if (this.status !== TransactionStatus.PENDING) {
      throw new InvalidTransactionStatusError(this.status, TransactionStatus.PENDING);
    }

    return new Transaction(
      this.id,
      this.fromUserId,
      this.toUserId,
      this.amount,
      TransactionStatus.CONFIRMED,
      this.createdAt,
      new Date()
    );
  }

  public markAsRejected(): Transaction {
    if (this.status !== TransactionStatus.PENDING) {
      throw new InvalidTransactionStatusError(this.status, TransactionStatus.PENDING);
    }

    return new Transaction(
      this.id,
      this.fromUserId,
      this.toUserId,
      this.amount,
      TransactionStatus.REJECTED,
      this.createdAt,
      new Date()
    );
  }
}
