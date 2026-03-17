import { DomainError } from './domain.error';
import { TransactionStatus } from '@domain/model/transaction.entity';

export class TransactionPendingNotFoundError extends DomainError {
  public static readonly errorCode = 'TRANSACTION_PENDING_NOT_FOUND';
  constructor(transactionId: string) {
    super(
      `Transaction ${transactionId} not found with status ${TransactionStatus.PENDING}`,
      TransactionPendingNotFoundError.errorCode,
      { transactionId }
    );
  }
}

export class InvalidTransactionStatusError extends DomainError {
  public static readonly errorCode = 'INVALID_TRANSACTION_STATUS';
  constructor(current: TransactionStatus, expected: TransactionStatus) {
    super(
      `Invalid transaction status: expected ${expected} but current is ${current}`,
      InvalidTransactionStatusError.errorCode,
      { current, expected }
    );
  }
}

export class TransactionRequiresManualApprovalError extends DomainError {
  public static readonly errorCode = 'TRANSACTION_REQUIRES_MANUAL_APPROVAL';
  constructor(transactionId: string, amount: number) {
    super(
      `Transaction ${transactionId} requires manual approval: amount ${amount} exceeds auto-approve limit`,
      TransactionRequiresManualApprovalError.errorCode,
      { transactionId, amount }
    );
  }
}

export class PendingTransactionExistsError extends DomainError {
  public static readonly errorCode = 'PENDING_TRANSACTION_EXISTS_FOR_SENDER';
  constructor(senderId: string, pendingTransactionId: string) {
    super(
      `User ${senderId} already has a pending transaction ${pendingTransactionId}`,
      PendingTransactionExistsError.errorCode,
      { senderId, pendingTransactionId }
    );
  }
}
