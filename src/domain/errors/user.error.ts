import { DomainError } from '@domain/errors/domain.error';

export class UserNotFoundError extends DomainError {
  public static readonly errorCode = 'USER_NOT_FOUND';
  constructor(userId: string) {
    super(`User not found: ${userId}`, UserNotFoundError.errorCode, { userId });
  }
}

export class UserInsufficientFundsError extends DomainError {
  public static readonly errorCode = 'USER_INSUFFICIENT_FUNDS';
  constructor(userId: string, balance: number, required: number) {
    super(
      `Insufficient funds for user ${userId}: balance is ${balance}, required ${required} to complete transaction`,
      UserInsufficientFundsError.errorCode,
      { userId, balance, required }
    );
  }
}
