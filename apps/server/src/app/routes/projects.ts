import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import {
  createComicProject,
  listComicProjects,
} from '@dreamweaverstudio/server-data-access-db';

const panelSchema = z.object({
  id: z.string(),
  order: z.number(),
  prompt: z.string(),
  imageUrl: z.string().url().optional(),
  negativePrompt: z.string().optional(),
  caption: z.string().optional(),
  dialogue: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const pageSchema = z.object({
  id: z.string(),
  pageNumber: z.number(),
  panels: z.array(panelSchema).default([]),
  title: z.string().optional(),
  notes: z.string().optional(),
});

const createProjectSchema = z.object({
  title: z.string().min(1),
  synopsis: z.string().optional(),
  status: z.enum(['draft', 'in-progress', 'completed']).optional(),
  pages: z.array(pageSchema).default([]),
  coverImageUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

export default async function projectsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/projects', async () => listComicProjects());

  fastify.post('/api/projects', async (request, reply) => {
    const parsed = createProjectSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Invalid request body',
        details: parsed.error.flatten(),
      });
    }

    const project = await createComicProject(parsed.data);

    return reply.code(201).send(project);
  });
}
