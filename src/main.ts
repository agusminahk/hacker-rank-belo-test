import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  process.on('SIGTERM', async () => {
    try {
      await app.close();
    } catch {
      process.exit(1);
    }
    process.exit(0);
  });
}

bootstrap();
