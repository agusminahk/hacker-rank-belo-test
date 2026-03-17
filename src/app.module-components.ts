import { CreateTransactionUseCase } from '@application/create-transaction.use-case';
import { TransactionsDomainService } from '@domain/services/transactions.domain-service';
import { TransactionsController } from '@infrastructure/rest/transactions.controller';

export const CONTROLLERS = [TransactionsController];

export const USE_CASES = [CreateTransactionUseCase];

export const DOMAIN_SERVICES = [TransactionsDomainService];
