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
      name: 'Test User',
      email: `${id}@test.com`,
      balance: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });
  }

  describe('save', () => {
    it('persiste y devuelve el usuario', async () => {
      const user = makeUser();

      const saved = await repository.save(user);

      expect(saved.id).toBe(user.id);
      expect(saved.name).toBe(user.name);
      expect(saved.email).toBe(user.email);
      expect(saved.balance).toBe(user.balance);
    });
  });

  describe('update', () => {
    it('actualiza el balance del usuario', async () => {
      const user = makeUser({ balance: 1000 });
      await repository.save(user);
      const updated = user.withNewBalance(500);

      await repository.update(updated);

      const found = await repository.findById(user.id);
      expect(found?.balance).toBe(500);
    });

    it('actualiza correctamente a balance 0', async () => {
      const user = makeUser({ balance: 100 });
      await repository.save(user);
      const updated = user.withNewBalance(0);

      await repository.update(updated);

      const found = await repository.findById(user.id);
      expect(found?.balance).toBe(0);
    });
  });

  describe('findById', () => {
    it('devuelve el usuario cuando existe', async () => {
      const user = makeUser();
      await repository.save(user);

      const found = await repository.findById(user.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(user.id);
      expect(found?.email).toBe(user.email);
    });

    it('devuelve null cuando el usuario no existe', async () => {
      const found = await repository.findById(randomUUID());
      expect(found).toBeNull();
    });

    it('devuelve el balance correcto luego de múltiples actualizaciones', async () => {
      const user = makeUser({ balance: 1000 });
      await repository.save(user);
      await repository.update(user.withNewBalance(800));
      await repository.update(user.withNewBalance(600));

      const found = await repository.findById(user.id);

      expect(found?.balance).toBe(600);
    });
  });
});
