import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';

function parseOrigins(raw: string | undefined): string[] | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const items = trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/\/+$/, ''));
  if (items.includes('*')) return undefined;
  return items;
}

export default fp(async function (fastify: FastifyInstance) {
  const origins = parseOrigins(process.env.CORS_ORIGIN);
  const isLocal = process.env.NODE_ENV !== 'production';

  await fastify.register(fastifyCors, {
    origin: origins && origins.length > 0 ? origins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  });
});
