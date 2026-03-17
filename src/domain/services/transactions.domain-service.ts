import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '@domain/model/transaction.entity';
import { TRANSACTION_REPOSITORY, TransactionRepository } from '@domain/port/transaction.repository';

export interface GenerateTransactionInput {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

@Injectable()
export class TransactionsDomainService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository
  ) {}

  async generateTransaction(input: GenerateTransactionInput): Promise<Transaction> {
    const transaction = Transaction.create(input);
    return this.transactionRepository.save(transaction);
  }
}
