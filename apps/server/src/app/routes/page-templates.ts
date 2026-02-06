import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import {
  createPageTemplate,
  deletePageTemplate,
  getPageTemplateById,
  listPageTemplates,
  updatePageTemplate,
} from '@dreamweaverstudio/server-data-access-db';

const listQuerySchema = z.object({
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
  q: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
});

const pageTemplatePayloadSchema = z.object({
  name: z.string().min(1),
  key: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['story', 'cover', 'character', 'other']).optional(),
  orientation: z.enum(['portrait', 'landscape', 'square']).optional(),
  aspectRatio: z.string().min(1).optional(),
  layout: z.enum(['single', 'grid', 'custom']).optional(),
  rows: z.number().int().min(1).optional(),
  cols: z.number().int().min(1).optional(),
  panelCount: z.number().int().min(1).optional(),
  gutter: z.number().min(0).optional(),
  safeArea: z.number().min(0).optional(),
  resolutionTier: z.enum(['standard', 'hd', 'uhd']).optional(),
  status: z.enum(['active', 'archived']).optional(),
  isDefault: z.boolean().optional(),
});

const pageTemplateUpdateSchema = pageTemplatePayloadSchema.partial();

export default async function pageTemplatesRoutes(fastify: FastifyInstance) {
  fastify.get('/page-templates', async (request) => {
    const parsed = listQuerySchema.safeParse(request.query);
    const query = parsed.success ? parsed.data : {};

    return listPageTemplates({
      page: query.page,
      pageSize: query.pageSize,
      search: query.q,
      status: query.status,
    });
  });

  fastify.get('/page-templates/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const template = await getPageTemplateById(id);

    if (!template) {
      return reply.code(404).send({ message: 'Page template not found' });
    }

    return template;
  });

  fastify.post('/page-templates', async (request, reply) => {
    const parsed = pageTemplatePayloadSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Invalid request body',
        details: parsed.error.flatten(),
      });
    }

    const template = await createPageTemplate(parsed.data);
    return reply.code(201).send(template);
  });

  fastify.put('/page-templates/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = pageTemplateUpdateSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Invalid request body',
        details: parsed.error.flatten(),
      });
    }

    const template = await updatePageTemplate(id, parsed.data);
    if (!template) {
      return reply.code(404).send({ message: 'Page template not found' });
    }

    return template;
  });

  fastify.delete('/page-templates/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const removed = await deletePageTemplate(id);

    if (!removed) {
      return reply.code(404).send({ message: 'Page template not found' });
    }

    return { ok: true };
  });
}
