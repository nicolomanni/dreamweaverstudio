import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';

function parseOrigins(raw: string | undefined): string[] | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
}

export default fp(async function (fastify: FastifyInstance) {
  const origins = parseOrigins(process.env.CORS_ORIGIN);

  await fastify.register(fastifyCors, {
    origin: origins && origins.length > 0 ? origins : true,
    credentials: true,
  });
});
