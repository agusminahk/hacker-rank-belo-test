import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeORMTransactionRepository } from '@infrastructure/adapters/repositories/transaction/typeorm-transaction.repository';
import { TransactionPersistence } from '@infrastructure/adapters/repositories/transaction/transaction.persistence';
import { UserPersistence } from '@infrastructure/adapters/repositories/user/user.persistence';
import { Transaction, TransactionStatus } from '@domain/model/transaction.entity';
import { PostgreSqlContainer } from '@test/containers/postgre-sql-container';

describe(TypeORMTransactionRepository.name, () => {
  let container: PostgreSqlContainer;
  let repository: TypeORMTransactionRepository;

  beforeAll(async () => {
    container = await PostgreSqlContainer.create();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...container.getConfig(),
          entities: [TransactionPersistence, UserPersistence],
        }),
        TypeOrmModule.forFeature([TransactionPersistence]),
      ],
      providers: [TypeORMTransactionRepository],
    }).compile();

    repository = module.get<TypeORMTransactionRepository>(TypeORMTransactionRepository);
  }, 60_000);

  afterAll(async () => {
    await container?.stop();
  });

  function makePendingTx(
    overrides: Partial<{ id: string; fromUserId: string; toUserId: string; amount: number }> = {}
  ): Transaction {
    return Transaction.createExisting({
      id: randomUUID(),
      fromUserId: randomUUID(),
      toUserId: randomUUID(),
      amount: 100,
      status: TransactionStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });
  }

  describe('save', () => {
    it('persists the transaction and returns it as a domain entity', async () => {
      const tx = makePendingTx();

      const saved = await repository.save(tx);

      expect(saved.id).toBe(tx.id);
      expect(saved.fromUserId).toBe(tx.fromUserId);
      expect(saved.toUserId).toBe(tx.toUserId);
      expect(saved.amount).toBe(tx.amount);
      expect(saved.status).toBe(TransactionStatus.PENDING);
    });
  });

  describe('update', () => {
    it('persists the updated status of an existing transaction', async () => {
      const tx = makePendingTx();
      await repository.save(tx);
      const confirmed = tx.markAsConfirmed();

      await repository.update(confirmed);

      const found = await repository.findByIdAndStatus(tx.id, TransactionStatus.CONFIRMED);
      expect(found).not.toBeNull();
      expect(found?.status).toBe(TransactionStatus.CONFIRMED);
    });
  });

  describe('findByIdAndStatus', () => {
    it('returns the transaction when both id and status match', async () => {
      const tx = makePendingTx();
      await repository.save(tx);

      const found = await repository.findByIdAndStatus(tx.id, TransactionStatus.PENDING);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(tx.id);
      expect(found?.status).toBe(TransactionStatus.PENDING);
    });

    it('returns null when the transaction exists but has a different status', async () => {
      const tx = makePendingTx();
      await repository.save(tx);

      const found = await repository.findByIdAndStatus(tx.id, TransactionStatus.CONFIRMED);

      expect(found).toBeNull();
    });

    it('returns null when no transaction exists with the given ID', async () => {
      const found = await repository.findByIdAndStatus(randomUUID(), TransactionStatus.PENDING);

      expect(found).toBeNull();
    });
  });

  describe('findByUserIdOrderedByDate', () => {
    it('returns transactions where user is the sender, sorted by createdAt descending', async () => {
      const userId = randomUUID();
      const tx1 = makePendingTx({ fromUserId: userId });
      const tx2 = makePendingTx({ fromUserId: userId });
      await repository.save(tx1);
      await repository.save(tx2);

      const results = await repository.findByUserIdOrderedByDate(userId);

      expect(results).toHaveLength(2);
      // Verify DESC ordering by date — the first result must be as recent or more recent than the second
      expect(results[0].createdAt.getTime()).toBeGreaterThanOrEqual(results[1].createdAt.getTime());
    });

    it('also returns transactions where the user is the receiver', async () => {
      const userId = randomUUID();
      const tx = makePendingTx({ toUserId: userId });
      await repository.save(tx);

      const results = await repository.findByUserIdOrderedByDate(userId);

      expect(results.some((t) => t.id === tx.id)).toBe(true);
    });

    it('returns an empty array when the user has no transactions', async () => {
      const results = await repository.findByUserIdOrderedByDate(randomUUID());

      expect(results).toHaveLength(0);
    });
  });

  describe('findPendingBySenderId', () => {
    it('returns the pending transaction for the given sender', async () => {
      const senderId = randomUUID();
      const tx = makePendingTx({ fromUserId: senderId });
      await repository.save(tx);

      const found = await repository.findPendingBySenderId(senderId);

      expect(found).not.toBeNull();
      expect(found?.fromUserId).toBe(senderId);
      expect(found?.status).toBe(TransactionStatus.PENDING);
    });

    it('returns null when the sender has no pending transactions', async () => {
      const found = await repository.findPendingBySenderId(randomUUID());

      expect(found).toBeNull();
    });

    it('returns null when the sender transaction was already confirmed', async () => {
      const senderId = randomUUID();
      const tx = makePendingTx({ fromUserId: senderId });
      await repository.save(tx);
      await repository.update(tx.markAsConfirmed());

      const found = await repository.findPendingBySenderId(senderId);

      expect(found).toBeNull();
    });
  });
});
