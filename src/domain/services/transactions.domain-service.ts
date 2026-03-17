import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_AUTO_APPROVE_LIMIT, Transaction, TransactionStatus } from '@domain/model/transaction.entity';
import { User } from '@domain/model/user.entity';
import { TRANSACTION_REPOSITORY, TransactionRepository } from '@domain/port/transaction.repository';
import { USER_REPOSITORY, UserRepository } from '@domain/port/user.repository';
import { TransactionPendingNotFoundError, PendingTransactionExistsError } from '@domain/errors/transaction.error';
import { UserNotFoundError, UserInsufficientFundsError } from '@domain/errors/user.error';

export interface GenerateTransactionInput {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

@Injectable()
export class TransactionsDomainService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async generateTransaction(input: GenerateTransactionInput): Promise<Transaction> {
    const { sender, receiver } = await this.findTransactionParts(input.fromUserId, input.toUserId);

    await this.validateNoPendingTransaction(input.fromUserId);

    const transaction = Transaction.create(input);

    if (transaction.amount > TRANSACTION_AUTO_APPROVE_LIMIT) {
      if (sender.balance < input.amount) {
        throw new UserInsufficientFundsError(sender.id, sender.balance, input.amount);
      }
      return this.transactionRepository.save(transaction);
    }

    return this.confirmAndTransferFunds(transaction, sender, receiver);
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.findByUserIdOrderedByDate(userId);
  }

  async approveTransaction(transactionId: string): Promise<Transaction> {
    const transaction = await this.getPendingTransaction(transactionId);

    const { sender, receiver } = await this.findTransactionParts(transaction.fromUserId, transaction.toUserId);

    const transactionRequiresManualApproval = transaction.amount > TRANSACTION_AUTO_APPROVE_LIMIT;

    if (transactionRequiresManualApproval) {
      if (sender.balance < transaction.amount) {
        throw new UserInsufficientFundsError(sender.id, sender.balance, transaction.amount);
      }

      console.warn(`Transaction ${transaction.id} requires manual approval.`);
      return this.transactionRepository.save(transaction);
    }

    return this.confirmAndTransferFunds(transaction, sender, receiver);
  }

  async rejectTransaction(transactionId: string): Promise<Transaction> {
    const transaction = await this.getPendingTransaction(transactionId);

    const rejectedTransaction = transaction.markAsRejected();
    await this.transactionRepository.update(rejectedTransaction);

    console.info(`Transaction ${transaction.id} rejected.`);
    return rejectedTransaction;
  }

  private async findTransactionParts(fromUserId: string, toUserId: string): Promise<{ sender: User; receiver: User }> {
    const sender = await this.userRepository.findById(fromUserId);
    if (!sender) throw new UserNotFoundError(fromUserId);

    const receiver = await this.userRepository.findById(toUserId);
    if (!receiver) throw new UserNotFoundError(toUserId);

    return { sender, receiver };
  }

  private async confirmAndTransferFunds(transaction: Transaction, sender: User, receiver: User): Promise<Transaction> {
    if (sender.balance < transaction.amount) {
      throw new UserInsufficientFundsError(sender.id, sender.balance, transaction.amount);
    }

    const updatedSender = sender.withNewBalance(sender.balance - transaction.amount);
    const updatedReceiver = receiver.withNewBalance(receiver.balance + transaction.amount);
    const confirmedTransaction = transaction.markAsConfirmed();

    await this.userRepository.update(updatedSender);
    await this.userRepository.update(updatedReceiver);
    await this.transactionRepository.update(confirmedTransaction);

    console.info(`Transaction ${transaction.id} confirmed and funds transferred.`);
    return confirmedTransaction;
  }

  private async getPendingTransaction(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findByIdAndStatus(transactionId, TransactionStatus.PENDING);

    if (!transaction) {
      throw new TransactionPendingNotFoundError(transactionId);
    }

    return transaction;
  }

  private async validateNoPendingTransaction(senderId: string): Promise<void> {
    const existing = await this.transactionRepository.findPendingBySenderId(senderId);
    if (existing) {
      throw new PendingTransactionExistsError(senderId, existing.id);
    }
  }
}
