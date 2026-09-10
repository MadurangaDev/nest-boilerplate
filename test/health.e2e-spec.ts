import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';

// Boots the real AppModule -- including PrismaModule -- so this needs a
// real, migrated database behind DATABASE_URL. Unlike the *.spec.ts unit
// tests, this is not runnable without one.
describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health responds through the standard envelope', async () => {
    // Nest's own INestApplication.getHttpServer() is typed `any`; supertest
    // has no narrower overload for it.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toHaveProperty('body');
    expect(res.body).toHaveProperty('message');
  });
});
