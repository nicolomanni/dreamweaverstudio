import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';

const schema = {
  type: 'object',
  required: ['MONGO_URI'],
  properties: {
    MONGO_URI: { type: 'string', default: 'mongodb://localhost:27017/dreamweaverstudio' },
    HOST: { type: 'string', default: 'localhost' },
    PORT: { type: 'integer', default: 3000 },
    CORS_ORIGIN: { type: 'string', default: '' },
    GEMINI_API_KEY: { type: 'string' },
    STRIPE_SECRET: { type: 'string' },
    FIREBASE_PROJECT_ID: { type: 'string' },
    FIREBASE_CLIENT_EMAIL: { type: 'string' },
    FIREBASE_PRIVATE_KEY: { type: 'string' },
    FIREBASE_STORAGE_BUCKET: { type: 'string' },
  },
};

export default fp(async function (fastify: FastifyInstance) {
  await fastify.register(fastifyEnv, {
    schema,
    dotenv: true,
  });
});
