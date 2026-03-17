import { Injectable } from '@nestjs/common';
import { Transaction } from '@domain/model/transaction.entity';
import { TransactionsDomainService } from '@domain/services/transactions.domain-service';

@Injectable()
export class ApproveTransactionUseCase {
  constructor(private readonly transactionsDomainService: TransactionsDomainService) {}

  async execute(transactionId: string): Promise<Transaction> {
    return this.transactionsDomainService.approveTransaction(transactionId);
  }
}
