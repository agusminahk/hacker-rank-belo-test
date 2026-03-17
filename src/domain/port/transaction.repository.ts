import { Transaction, TransactionStatus } from '@domain/model/transaction.entity';

export const TRANSACTION_REPOSITORY = 'TransactionRepository';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<void>;
  findByIdAndStatus(transactionId: string, status: TransactionStatus): Promise<Transaction | null>;
  findByUserIdOrderedByDate(userId: string): Promise<Transaction[]>;
  findPendingBySenderId(senderId: string): Promise<Transaction | null>;
}
