import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import {
  connectToMongo,
  disconnectFromMongo,
} from '@dreamweaverstudio/server-data-access-db';

export default fp(async function (fastify: FastifyInstance) {
  const mongoUri = fastify.config.MONGO_URI;

  await connectToMongo(mongoUri);

  fastify.addHook('onClose', async () => {
    await disconnectFromMongo();
  });
});
