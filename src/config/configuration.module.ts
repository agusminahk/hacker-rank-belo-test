import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigKeys } from '@src/config/config-keys';
import Joi from 'joi';

@Module({})
export class ConfigurationModule {
  private static readonly DEFAULT_ENV_FILE = '/.env';

  static forRoot(envFile?: string): DynamicModule {
    return {
      module: ConfigurationModule,
      imports: [
        ConfigModule.forRoot({
          load: [],
          envFilePath: process.cwd() + (envFile ?? ConfigurationModule.DEFAULT_ENV_FILE),
          validationSchema: Joi.object({
            [ConfigKeys.PORT]: Joi.number().default(3000),
          }),
          isGlobal: true,
        }),
      ],
      exports: [ConfigModule],
    };
  }
}
