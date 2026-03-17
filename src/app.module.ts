import { Module } from '@nestjs/common';
import { CONTROLLERS } from '@src/app.module-components';

@Module({
  imports: [],
  controllers: [...CONTROLLERS],
  providers: [],
})
export class AppModule {}
