import { CreateTransactionUseCase } from '@application/create-transaction.use-case';
import { TRANSACTION_REPOSITORY } from '@domain/port/transaction.repository';
import { USER_REPOSITORY } from '@domain/port/user.repository';
import { TransactionsDomainService } from '@domain/services/transactions.domain-service';
import { TransactionsController } from '@infrastructure/rest/transactions.controller';
import { TypeORMTransactionRepository } from '@infrastructure/repositories/transaction/typeorm-transaction.repository';
import { TypeORMUserRepository } from '@infrastructure/repositories/user/typeorm-user.repository';
import { GetTransactionsByUserUseCase } from '@application/get-transactions-by-user.use-case';

export const CONTROLLERS = [TransactionsController];

export const USE_CASES = [CreateTransactionUseCase, GetTransactionsByUserUseCase];

export const DOMAIN_SERVICES = [TransactionsDomainService];

export const REPOSITORIES = [
  { provide: TRANSACTION_REPOSITORY, useClass: TypeORMTransactionRepository },
  { provide: USER_REPOSITORY, useClass: TypeORMUserRepository },
];
