import { Injectable } from '@nestjs/common';
import { Transaction } from '@domain/model/transaction.entity';
import { TransactionsDomainService } from '@domain/services/transactions.domain-service';

@Injectable()
export class GetTransactionsByUserUseCase {
  constructor(private readonly transactionsDomainService: TransactionsDomainService) {}

  async execute(userId: string): Promise<Transaction[]> {
    return await this.transactionsDomainService.getTransactionsByUser(userId);
  }
}
