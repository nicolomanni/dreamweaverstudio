import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      MONGO_URI: string;
      HOST: string;
      PORT: number;
    };
  }
}
