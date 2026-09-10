import { Params } from 'nestjs-pino';

// One structured logging pipeline (replaces the Express boilerplate's
// Pino + Morgan pair). nestjs-pino attaches a request id to every log line
// automatically, which the old repo never had.
export const pinoConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
    redact: ['req.headers.authorization'],
    autoLogging: true,
  },
};
