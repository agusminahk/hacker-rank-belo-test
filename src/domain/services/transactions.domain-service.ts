import { Transaction } from '@domain/model/transaction.entity';

export interface GenerateTransactionInput {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export class TransactionsDomainService {
  constructor() {}

  async generateTransaction(input: GenerateTransactionInput): Promise<Transaction> {
    console.log('transaction', input);

    return {} as any;
  }
}
