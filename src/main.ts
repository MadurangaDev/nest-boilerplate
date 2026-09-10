import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Without this, onModuleDestroy() (PrismaService's $disconnect) never runs
  // on SIGTERM/SIGINT -- the process would just die mid-connection instead
  // of closing cleanly on deploy or restart.
  app.enableShutdownHooks();

  app.useLogger(app.get(Logger));
  app.use(helmet());

  const config = app.get(ConfigService);
  app.enableCors({ origin: config.get<string>('app.corsOrigin') });

  if (config.get<string>('app.nodeEnv') !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('API').setVersion('0.1.0').addBearerAuth().build(),
    );
    SwaggerModule.setup('docs', app, cleanupOpenApiDoc(document));
  }

  const port = config.get<number>('app.port') ?? 3000;
  await app.listen(port);
}

void bootstrap();
