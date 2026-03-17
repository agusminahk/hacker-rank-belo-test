import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '@domain/model/transaction.entity';
import { TransactionRepository } from '@domain/port/transaction.repository';
import { TransactionPersistence } from '@infrastructure/repositories/transaction/transaction.persistence';

@Injectable()
export class TypeORMTransactionRepository implements TransactionRepository {
  constructor(
    @InjectRepository(TransactionPersistence)
    private readonly repository: Repository<TransactionPersistence>
  ) {}

  async save(transaction: Transaction): Promise<Transaction> {
    const persistence = TransactionPersistence.fromDomain(transaction);
    const saved = await this.repository.save(persistence);
    return saved.toDomain();
  }

  async update(transaction: Transaction): Promise<void> {
    const persistence = TransactionPersistence.fromDomain(transaction);
    await this.repository.update({ id: persistence.id }, persistence);
  }

  async findById(transactionId: string): Promise<Transaction | null> {
    const persistence = await this.repository.findOne({ where: { id: transactionId } });
    return persistence ? persistence.toDomain() : null;
  }

  async findByUserIdOrderedByDate(userId: string): Promise<Transaction[]> {
    const results = await this.repository.find({
      where: [{ fromUserId: userId }, { toUserId: userId }],
      order: { createdAt: 'DESC' },
    });
    return results.map((p) => p.toDomain());
  }
}
