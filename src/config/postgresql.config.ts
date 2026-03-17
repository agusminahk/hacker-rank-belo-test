import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';

import Joi from 'joi';
import { ConfigKeys } from '@config/config-keys';
import { TransactionPersistence } from '@infrastructure/repositories/transaction/transaction.persistence';
import { UserPersistence } from '@infrastructure/repositories/user/user.persistence';

export const ENTITIES = [TransactionPersistence, UserPersistence];

const ORM_TYPE = 'postgres';

export const datasource = new DataSource({
  type: ORM_TYPE,
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'payments',
  entities: ENTITIES,
  synchronize: true,
});

@Module({})
export class PostgresModule {
  static forRoot(typeOrmOptions?: TypeOrmModuleOptions, entities: EntityClassOrSchema[] = ENTITIES): DynamicModule {
    return {
      module: PostgresModule,
      imports: [
        ConfigModule.forRoot({
          validationSchema: Joi.object({
            [ConfigKeys.POSTGRES_HOST]: Joi.string().required(),
            [ConfigKeys.POSTGRES_PORT]: Joi.number().required(),
            [ConfigKeys.POSTGRES_USER]: Joi.string().required(),
            [ConfigKeys.POSTGRES_PASSWORD]: Joi.string().required(),
            [ConfigKeys.POSTGRES_DB]: Joi.string().required(),
          }),
        }),
        TypeOrmModule.forRootAsync({
          useFactory: (): TypeOrmModuleOptions => {
            return {
              ...this.getDefaultPostgresSqlConfig(),
              ...typeOrmOptions,
            } as TypeOrmModuleOptions;
          },
        }),
        TypeOrmModule.forFeature(entities),
      ],
      exports: [TypeOrmModule],
    };
  }

  static getDefaultPostgresSqlConfig(): TypeOrmModuleOptions {
    return {
      ...datasource.options,
      migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN == 'true',
    } as TypeOrmModuleOptions;
  }
}
