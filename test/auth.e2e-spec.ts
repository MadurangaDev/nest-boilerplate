import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
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

  it('rejects an invalid body through the same envelope as a success response', async () => {
    // Nest's own INestApplication.getHttpServer() is typed `any`; supertest
    // has no narrower overload for it.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: '123' })
      .expect(400);

    const body = res.body as { message: string; body: { errors: unknown[] } };
    expect(body.message).toBe('Validation failed');
    expect(Array.isArray(body.body.errors)).toBe(true);
  });

  it('rejects unknown credentials with 401, same envelope, no leaked detail', async () => {
    // Nest's own INestApplication.getHttpServer() is typed `any`; supertest
    // has no narrower overload for it.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever-long-enough' })
      .expect(401);

    expect(res.body).toEqual({ message: 'Invalid credentials', body: null });
  });
});
