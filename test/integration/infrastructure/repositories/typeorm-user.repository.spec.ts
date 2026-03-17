import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeORMUserRepository } from '@infrastructure/adapters/repositories/user/typeorm-user.repository';
import { UserPersistence } from '@infrastructure/adapters/repositories/user/user.persistence';
import { TransactionPersistence } from '@infrastructure/adapters/repositories/transaction/transaction.persistence';
import { User } from '@domain/model/user.entity';
import { PostgreSqlContainer } from '@test/containers/postgre-sql-container';

describe(TypeORMUserRepository.name, () => {
  let container: PostgreSqlContainer;
  let repository: TypeORMUserRepository;

  beforeAll(async () => {
    container = await PostgreSqlContainer.create();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...container.getConfig(),
          entities: [UserPersistence, TransactionPersistence],
        }),
        TypeOrmModule.forFeature([UserPersistence]),
      ],
      providers: [TypeORMUserRepository],
    }).compile();

    repository = module.get<TypeORMUserRepository>(TypeORMUserRepository);
  }, 60_000);

  afterAll(async () => {
    await container?.stop();
  });

  function makeUser(
    overrides: Partial<{
      id: string;
      name: string;
      email: string;
      balance: number;
    }> = {}
  ): User {
    const id = overrides.id ?? randomUUID();
    return User.createExisting({
      id,
      name: 'Alice',
      email: `${id}@test.com`,
      balance: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });
  }

  describe('save', () => {
    it('persists the user and returns it as a domain entity', async () => {
      const user = makeUser();

      const saved = await repository.save(user);

      expect(saved.id).toBe(user.id);
      expect(saved.name).toBe(user.name);
      expect(saved.email).toBe(user.email);
      expect(saved.balance).toBe(user.balance);
    });
  });

  describe('update', () => {
    it('persists the new balance after a balance change', async () => {
      const user = makeUser({ balance: 1000 });
      await repository.save(user);
      const updated = user.withNewBalance(500);

      await repository.update(updated);

      const found = await repository.findById(user.id);
      expect(found?.balance).toBe(500);
    });

    it('correctly persists balance when updated to zero', async () => {
      const user = makeUser({ balance: 100 });
      await repository.save(user);
      const updated = user.withNewBalance(0);

      await repository.update(updated);

      const found = await repository.findById(user.id);
      expect(found?.balance).toBe(0);
    });
  });

  describe('findById', () => {
    it('returns the user when it exists in the database', async () => {
      const user = makeUser();
      await repository.save(user);

      const found = await repository.findById(user.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(user.id);
      expect(found?.email).toBe(user.email);
    });

    it('returns null when no user exists with the given ID', async () => {
      const found = await repository.findById(randomUUID());
      expect(found).toBeNull();
    });

    it('reflects the last update when the balance is modified multiple times', async () => {
      const user = makeUser({ balance: 1000 });
      await repository.save(user);
      await repository.update(user.withNewBalance(800));
      await repository.update(user.withNewBalance(600));

      const found = await repository.findById(user.id);

      expect(found?.balance).toBe(600);
    });
  });
});
