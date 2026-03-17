import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Client } from 'pg';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class PostgreSqlContainer {
  private static DATABASE = 'test';
  private static USER = 'test';
  private static PASSWORD = 'test';
  private static SCHEMA = 'test';
  container: StartedTestContainer;

  static async create(): Promise<PostgreSqlContainer> {
    const postgresqlContainer = new PostgreSqlContainer();
    await postgresqlContainer.start();
    return postgresqlContainer;
  }

  async start(): Promise<void> {
    this.container = await new GenericContainer('postgres')
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_DATABASE: PostgreSqlContainer.DATABASE,
        POSTGRES_USER: PostgreSqlContainer.USER,
        POSTGRES_PASSWORD: PostgreSqlContainer.PASSWORD,
      })
      .start();

    await this.waitForPostgres();

    const client = new Client({
      host: this.container.getHost(),
      port: this.container.getMappedPort(5432),
      user: PostgreSqlContainer.USER,
      password: PostgreSqlContainer.PASSWORD,
      database: PostgreSqlContainer.DATABASE,
    });

    await client.connect();
    await client.query(
      `CREATE SCHEMA IF NOT EXISTS "${PostgreSqlContainer.SCHEMA}"`
    );
    await client.end();
  }

  async stop(): Promise<void> {
    await this.container.stop();
  }

  getConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.container.getHost(),
      port: this.container.getMappedPort(5432),
      username: PostgreSqlContainer.USER,
      password: PostgreSqlContainer.PASSWORD,
      database: PostgreSqlContainer.DATABASE,
      schema: PostgreSqlContainer.SCHEMA,
      synchronize: true,
    };
  }

  private async waitForPostgres(): Promise<void> {
    const maxRetries = 10;
    const delay = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const client = new Client({
          host: this.container.getHost(),
          port: this.container.getMappedPort(5432),
          user: PostgreSqlContainer.USER,
          password: PostgreSqlContainer.PASSWORD,
          database: 'postgres',
        });

        await client.connect();
        await client.end();
        return;
      } catch {
        if (i < maxRetries - 1) {
          console.log('Waiting for PostgreSQL to be ready...');
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw new Error('PostgreSQL did not start in time.');
        }
      }
    }
  }
}
