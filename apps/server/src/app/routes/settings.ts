import { FastifyInstance } from 'fastify';
import {
  getStudioSettings,
  updateStudioSettings,
  getUserProfile,
  updateUserProfile,
} from '@dreamweaverstudio/server-data-access-db';

type GeneralPayload = {
  displayName?: string;
  email?: string;
  studioName?: string;
  timezone?: string;
};

type ProfilePayload = {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
};

export default async function (fastify: FastifyInstance) {
  fastify.get('/settings/general', async () => {
    return getStudioSettings();
  });

  fastify.put('/settings/general', async (request) => {
    const payload = (request.body ?? {}) as GeneralPayload;
    return updateStudioSettings(payload);
  });

  fastify.get('/settings/profile', async (request, reply) => {
    const uid = request.user?.uid;
    if (!uid) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
    const profile = await getUserProfile(uid);
    return profile ?? null;
  });

  fastify.put('/settings/profile', async (request, reply) => {
    const payload = (request.body ?? {}) as ProfilePayload;
    const uid = request.user?.uid;
    if (!uid) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
    return updateUserProfile(uid, payload);
  });
}
