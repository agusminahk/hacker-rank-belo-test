import { CreateTransactionUseCase } from '@application/create-transaction.use-case';
import { TRANSACTION_REPOSITORY } from '@domain/port/transaction.repository';
import { USER_REPOSITORY } from '@domain/port/user.repository';
import { TransactionsDomainService } from '@domain/services/transactions.domain-service';
import { TransactionsController } from '@infrastructure/rest/transactions.controller';
import { GetTransactionsByUserUseCase } from '@application/get-transactions-by-user.use-case';
import { RejectTransactionUseCase } from '@application/reject-transaction.use-case';
import { ApproveTransactionUseCase } from '@application/approve-transaction.use-case';
import { TypeORMUserRepository } from '@infrastructure/adapters/repositories/user/typeorm-user.repository';
import { TypeORMTransactionRepository } from '@infrastructure/adapters/repositories/transaction/typeorm-transaction.repository';

export const CONTROLLERS = [TransactionsController];

export const USE_CASES = [
  CreateTransactionUseCase,
  GetTransactionsByUserUseCase,
  ApproveTransactionUseCase,
  RejectTransactionUseCase,
];

export const DOMAIN_SERVICES = [TransactionsDomainService];

export const REPOSITORIES = [
  { provide: TRANSACTION_REPOSITORY, useClass: TypeORMTransactionRepository },
  { provide: USER_REPOSITORY, useClass: TypeORMUserRepository },
];
