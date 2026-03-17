import { Transaction } from '@domain/model/transaction.entity';

export const TRANSACTION_REPOSITORY = 'TransactionRepository';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<void>;
  findById(transactionId: string): Promise<Transaction | null>;
  findByUserIdOrderedByDate(userId: string): Promise<Transaction[]>;
}
