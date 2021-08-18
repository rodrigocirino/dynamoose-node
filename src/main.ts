import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();

  await app.listen(parseInt(process.env.PORT));
  logger.log(`🚀 Server ready at ${await app.getUrl()}/`);

  new AppService(new ConfigService()).main();
}
bootstrap();
