import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import * as admin from 'firebase-admin';

declare module 'fastify' {
  interface FastifyRequest {
    user?: admin.auth.DecodedIdToken;
  }
}

const PUBLIC_PATHS = new Set(['/health', '/']);

export default fp(async function (fastify: FastifyInstance) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!admin.apps.length) {
    if (!projectId || !clientEmail || !privateKey) {
      fastify.log.error(
        'Firebase admin not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.',
      );
      throw new Error('Firebase admin is not configured.');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  fastify.addHook('onRequest', async (request: FastifyRequest, reply) => {
    if (request.method === 'OPTIONS') {
      return;
    }
    const path = request.url.split('?')[0];
    if (PUBLIC_PATHS.has(path)) {
      return;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ message: 'Unauthorized' });
      return;
    }

    const token = authHeader.slice(7);
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      request.user = decoded;
    } catch (error) {
      reply.code(401).send({ message: 'Unauthorized' });
      return;
    }
  });
});
