import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CONTROLLERS, DOMAIN_SERVICES, REPOSITORIES, USE_CASES } from '@src/app.module-components';
import { TransactionPersistence } from '@infrastructure/adapters/repositories/transaction/transaction.persistence';
import { UserPersistence } from '@infrastructure/adapters/repositories/user/user.persistence';
import { RestExceptionFilter } from '@infrastructure/shared/exception.filter';
import { PostgreSqlContainer } from '@test/containers/postgre-sql-container';

export class AppForTesting {
  public app: INestApplication;
  public postgreSqlContainer: PostgreSqlContainer;

  static async create(): Promise<AppForTesting> {
    const instance = new AppForTesting();
    await instance.setup();
    return instance;
  }

  public async setup(): Promise<void> {
    this.postgreSqlContainer = await PostgreSqlContainer.create();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...this.postgreSqlContainer.getConfig(),
          entities: [TransactionPersistence, UserPersistence],
        }),
        TypeOrmModule.forFeature([TransactionPersistence, UserPersistence]),
      ],
      controllers: [...CONTROLLERS],
      providers: [...USE_CASES, ...DOMAIN_SERVICES, ...REPOSITORIES],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    this.app.useGlobalFilters(new RestExceptionFilter());
    await this.app.init();
  }

  public async teardown(): Promise<void> {
    await this.app?.close();
    await this.postgreSqlContainer?.stop();
  }
}
