import { Transaction } from '@domain/model/transaction.entity';
import { GenerateTransactionInput, TransactionsDomainService } from '@domain/services/transactions.domain-service';
import { Inject } from '@nestjs/common';

export class CreateTransactionUseCase {
  constructor(
    @Inject()
    private readonly transactionsDomainService: TransactionsDomainService
  ) {}

  async execute(input: GenerateTransactionInput): Promise<Transaction> {
    return this.transactionsDomainService.generateTransaction(input);
  }
}
