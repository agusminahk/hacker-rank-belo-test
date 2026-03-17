import { Module } from '@nestjs/common';
import { CONTROLLERS, DOMAIN_SERVICES, USE_CASES } from '@src/app.module-components';

@Module({
  imports: [],
  controllers: [...CONTROLLERS],
  providers: [...USE_CASES, ...DOMAIN_SERVICES],
})
export class AppModule {}
