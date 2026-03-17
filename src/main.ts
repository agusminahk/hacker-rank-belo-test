import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '@src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Payments API')
    .setDescription('API for managing transactions between users')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

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
