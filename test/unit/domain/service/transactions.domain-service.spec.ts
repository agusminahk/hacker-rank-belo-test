import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { TRANSACTION_AUTO_APPROVE_LIMIT, Transaction, TransactionStatus } from '@domain/model/transaction.entity';
import { User } from '@domain/model/user.entity';
import { TRANSACTION_REPOSITORY, TransactionRepository } from '@domain/port/transaction.repository';
import { USER_REPOSITORY, UserRepository } from '@domain/port/user.repository';
import { TransactionsDomainService } from '@domain/services/transactions.domain-service';
import { TransactionPendingNotFoundError, PendingTransactionExistsError } from '@domain/errors/transaction.error';
import { UserNotFoundError, UserInsufficientFundsError } from '@domain/errors/user.error';

const ABOVE_LIMIT = TRANSACTION_AUTO_APPROVE_LIMIT + 1;
const BELOW_LIMIT = 100;

describe(TransactionsDomainService.name, () => {
  let service: TransactionsDomainService;
  const transactionRepo = createMock<TransactionRepository>();
  const userRepo = createMock<UserRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsDomainService,
        { provide: TRANSACTION_REPOSITORY, useValue: transactionRepo },
        { provide: USER_REPOSITORY, useValue: userRepo },
      ],
    }).compile();

    service = module.get<TransactionsDomainService>(TransactionsDomainService);
    jest.clearAllMocks();
  });

  function makeUser(id: string, balance: number): User {
    return User.createExisting({
      id,
      name: 'Alice',
      email: `${id}@test.com`,
      balance,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  function makePendingTransaction(id: string, fromUserId: string, toUserId: string, amount: number): Transaction {
    return Transaction.createExisting({
      id,
      fromUserId,
      toUserId,
      amount,
      status: TransactionStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  function setupUsers(senderBalance: number, receiverBalance = 500): void {
    userRepo.findById
      .mockResolvedValueOnce(makeUser('sender-id', senderBalance))
      .mockResolvedValueOnce(makeUser('receiver-id', receiverBalance));
  }

  describe('generateTransaction', () => {
    const input = { fromUserId: 'sender-id', toUserId: 'receiver-id', amount: BELOW_LIMIT };

    describe('when the amount is within the auto-approve limit', () => {
      it('immediately confirms the transaction and debits/credits both users', async () => {
        setupUsers(1000);
        transactionRepo.findPendingBySenderId.mockResolvedValue(null);
        transactionRepo.update.mockResolvedValue(undefined);
        userRepo.update.mockResolvedValue(undefined);

        const result = await service.generateTransaction(input);

        expect(result.status).toBe(TransactionStatus.CONFIRMED);
        expect(transactionRepo.update).toHaveBeenCalledWith(
          expect.objectContaining({ status: TransactionStatus.CONFIRMED })
        );
        expect(userRepo.update).toHaveBeenCalledTimes(2);
      });

      it('throws UserInsufficientFundsError when sender balance is lower than the transfer amount', async () => {
        setupUsers(50);
        transactionRepo.findPendingBySenderId.mockResolvedValue(null);

        await expect(service.generateTransaction(input)).rejects.toBeInstanceOf(UserInsufficientFundsError);
      });
    });

    describe('when the amount exceeds the auto-approve limit', () => {
      it('saves the transaction as PENDING and waits for manual approval', async () => {
        setupUsers(ABOVE_LIMIT + 1000);
        transactionRepo.findPendingBySenderId.mockResolvedValue(null);
        const pendingTx = makePendingTransaction('tx-id', 'sender-id', 'receiver-id', ABOVE_LIMIT);
        transactionRepo.save.mockResolvedValue(pendingTx);

        const result = await service.generateTransaction({ ...input, amount: ABOVE_LIMIT });

        expect(result.status).toBe(TransactionStatus.PENDING);
        expect(transactionRepo.save).toHaveBeenCalled();
      });

      it('throws UserInsufficientFundsError when sender does not have enough balance', async () => {
        setupUsers(100);
        transactionRepo.findPendingBySenderId.mockResolvedValue(null);

        await expect(service.generateTransaction({ ...input, amount: ABOVE_LIMIT })).rejects.toBeInstanceOf(
          UserInsufficientFundsError
        );
      });
    });

    it('throws UserNotFoundError when the sender does not exist', async () => {
      userRepo.findById.mockResolvedValueOnce(null);

      await expect(service.generateTransaction(input)).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it('throws UserNotFoundError when the receiver does not exist', async () => {
      userRepo.findById.mockResolvedValueOnce(makeUser('sender-id', 1000)).mockResolvedValueOnce(null);

      await expect(service.generateTransaction(input)).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it('throws PendingTransactionExistsError when sender already has an open pending transaction', async () => {
      setupUsers(1000);
      transactionRepo.findPendingBySenderId.mockResolvedValue(
        makePendingTransaction('existing-tx', 'sender-id', 'receiver-id', 100)
      );

      await expect(service.generateTransaction(input)).rejects.toBeInstanceOf(PendingTransactionExistsError);
    });
  });

  describe('getTransactionsByUser', () => {
    it('returns all transactions associated with the given user ID', async () => {
      const transactions = [makePendingTransaction('tx1', 'user-id', 'other-id', 100)];
      transactionRepo.findByUserIdOrderedByDate.mockResolvedValue(transactions);

      const result = await service.getTransactionsByUser('user-id');

      expect(result).toEqual(transactions);
      expect(transactionRepo.findByUserIdOrderedByDate).toHaveBeenCalledWith('user-id');
    });
  });

  describe('approveTransaction', () => {
    describe('when the amount is within the auto-approve limit', () => {
      it('confirms the transaction and transfers funds between the users', async () => {
        const tx = makePendingTransaction('tx-id', 'sender-id', 'receiver-id', BELOW_LIMIT);
        transactionRepo.findByIdAndStatus.mockResolvedValue(tx);
        setupUsers(1000);
        transactionRepo.update.mockResolvedValue(undefined);
        userRepo.update.mockResolvedValue(undefined);

        const result = await service.approveTransaction('tx-id');

        expect(result.status).toBe(TransactionStatus.CONFIRMED);
        expect(transactionRepo.update).toHaveBeenCalledWith(
          expect.objectContaining({ status: TransactionStatus.CONFIRMED })
        );
      });
    });

    describe('when the amount exceeds the auto-approve limit', () => {
      it('keeps the transaction as PENDING awaiting further manual confirmation', async () => {
        const tx = makePendingTransaction('tx-id', 'sender-id', 'receiver-id', ABOVE_LIMIT);
        transactionRepo.findByIdAndStatus.mockResolvedValue(tx);
        setupUsers(ABOVE_LIMIT + 1000);
        transactionRepo.save.mockResolvedValue(tx);

        await service.approveTransaction('tx-id');

        expect(transactionRepo.save).toHaveBeenCalled();
        expect(transactionRepo.update).not.toHaveBeenCalled();
      });

      it('throws UserInsufficientFundsError when sender balance is lower than the transaction amount', async () => {
        const tx = makePendingTransaction('tx-id', 'sender-id', 'receiver-id', ABOVE_LIMIT);
        transactionRepo.findByIdAndStatus.mockResolvedValue(tx);
        setupUsers(100);

        await expect(service.approveTransaction('tx-id')).rejects.toBeInstanceOf(UserInsufficientFundsError);
      });
    });

    it('throws TransactionPendingNotFoundError when no pending transaction exists with the given ID', async () => {
      transactionRepo.findByIdAndStatus.mockResolvedValue(null);

      await expect(service.approveTransaction('unknown-id')).rejects.toBeInstanceOf(TransactionPendingNotFoundError);
    });
  });

  describe('rejectTransaction', () => {
    it('marks the transaction as REJECTED without touching user balances', async () => {
      const tx = makePendingTransaction('tx-id', 'sender-id', 'receiver-id', BELOW_LIMIT);
      transactionRepo.findByIdAndStatus.mockResolvedValue(tx);
      transactionRepo.update.mockResolvedValue(undefined);

      const result = await service.rejectTransaction('tx-id');

      expect(result.status).toBe(TransactionStatus.REJECTED);
      expect(transactionRepo.update).toHaveBeenCalledWith(expect.objectContaining({ status: TransactionStatus.REJECTED }));
      expect(userRepo.update).not.toHaveBeenCalled();
    });

    it('throws TransactionPendingNotFoundError when no pending transaction exists with the given ID', async () => {
      transactionRepo.findByIdAndStatus.mockResolvedValue(null);

      await expect(service.rejectTransaction('unknown-id')).rejects.toBeInstanceOf(TransactionPendingNotFoundError);
    });
  });
});
