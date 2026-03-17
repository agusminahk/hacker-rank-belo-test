import { Module } from '@nestjs/common';
import { PostgresModule } from '@config/postgresql.config';
import { CONTROLLERS, DOMAIN_SERVICES, REPOSITORIES, USE_CASES } from '@src/app.module-components';
import { ConfigurationModule } from '@config/configuration.module';

@Module({
  imports: [ConfigurationModule.forRoot(), PostgresModule.forRoot()],
  controllers: [...CONTROLLERS],
  providers: [...USE_CASES, ...DOMAIN_SERVICES, ...REPOSITORIES],
})
export class AppModule {}
