import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
  type Part,
} from '@google/generative-ai';
import {
  listComicStyles,
  createComicStyle,
  updateComicStyle,
  deleteComicStyle,
  getComicStyleById,
  getIntegrationSettings,
} from '@dreamweaverstudio/server-data-access-db';

const visualStyleSchema = z
  .object({
    styleName: z.string().optional(),
    medium: z.string().optional(),
    lineart: z.string().optional(),
    coloring: z.string().optional(),
    lighting: z.string().optional(),
    anatomy: z.string().optional(),
  })
  .optional();

const safetySchema = z
  .object({
    sfwOnly: z.boolean().optional(),
  })
  .optional();

const stylePayloadSchema = z.object({
  name: z.string().min(1),
  key: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
  isDefault: z.boolean().optional(),
  previewImageUrl: z.string().optional(),
  visualStyle: visualStyleSchema,
  systemPrompt: z.string().optional(),
  promptTemplate: z.string().optional(),
  technicalTags: z.string().optional(),
  negativePrompt: z.string().optional(),
  continuityRules: z.string().optional(),
  formatGuidelines: z.string().optional(),
  interactionLanguage: z.string().optional(),
  promptLanguage: z.string().optional(),
  safety: safetySchema,
});

const styleUpdateSchema = stylePayloadSchema.partial();
const previewSchema = z.object({
  prompt: z.string().min(1),
  negativePrompt: z.string().optional(),
});

const STYLE_EXTRACTION_PROMPT = `You are a style extraction assistant. Convert the user's input into a JSON object that matches this schema:
{
  "name": string,
  "key": string,
  "description": string,
  "status": "active" | "archived",
  "isDefault": boolean,
  "previewImageUrl": string,
  "visualStyle": {
    "styleName": string,
    "medium": string,
    "lineart": string,
    "coloring": string,
    "lighting": string,
    "anatomy": string
  },
  "systemPrompt": string,
  "promptTemplate": string,
  "technicalTags": string,
  "negativePrompt": string,
  "continuityRules": string,
  "formatGuidelines": string,
  "interactionLanguage": string,
  "promptLanguage": string,
  "safety": {
    "sfwOnly": boolean
  }
}
Rules:
- Output ONLY valid JSON. No markdown, no code fences, no extra commentary.
- If a field is unknown, omit it.
- Keep strings concise, preserve original language for labels.
- Ensure promptTemplate remains in English unless explicitly requested otherwise.`;

const extractJsonFromText = (text: string) => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON found in response');
  }
  const snippet = text.slice(start, end + 1);
  return JSON.parse(snippet);
};

const stripDataUrlPrefix = (data: string) => {
  const commaIndex = data.indexOf(',');
  if (commaIndex === -1) return data;
  return data.slice(commaIndex + 1);
};

const listQuerySchema = z.object({
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
  q: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
});

const extractSchema = z.object({
  source: z.enum(['prompt', 'image']),
  prompt: z.string().optional(),
  image: z
    .object({
      data: z.string(),
      mimeType: z.string(),
    })
    .optional(),
});

export default async function stylesRoutes(fastify: FastifyInstance) {
  fastify.get('/styles', async (request) => {
    const parsed = listQuerySchema.safeParse(request.query);
    const query = parsed.success ? parsed.data : {};
    return listComicStyles({
      page: query.page,
      pageSize: query.pageSize,
      search: query.q,
      status: query.status,
    });
  });

  fastify.get('/styles/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const style = await getComicStyleById(id);
    if (!style) {
      return reply.code(404).send({ message: 'Style not found' });
    }
    return style;
  });

  fastify.post('/styles', async (request, reply) => {
    const parsed = stylePayloadSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Invalid request body',
        details: parsed.error.flatten(),
      });
    }
    const style = await createComicStyle(parsed.data);
    return reply.code(201).send(style);
  });

  fastify.put('/styles/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = styleUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Invalid request body',
        details: parsed.error.flatten(),
      });
    }
    const style = await updateComicStyle(id, parsed.data);
    if (!style) {
      return reply.code(404).send({ message: 'Style not found' });
    }
    return style;
  });

  fastify.post('/styles/extract', async (request, reply) => {
    const parsed = extractSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Invalid request body',
        details: parsed.error.flatten(),
      });
    }

    const settings = await getIntegrationSettings();
    const gemini = settings?.gemini;
    if (!gemini?.enabled || !gemini.apiKey) {
      return reply
        .code(400)
        .send({ message: 'Gemini integration is not configured.' });
    }

    const modelId = gemini.model ?? 'gemini-1.5-pro';
    const genAI = new GoogleGenerativeAI(gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });

    const parts: Part[] = [{ text: STYLE_EXTRACTION_PROMPT }];

    if (parsed.data.source === 'prompt') {
      if (!parsed.data.prompt) {
        return reply.code(400).send({ message: 'Prompt is required.' });
      }
      parts.push({ text: `User prompt:\n${parsed.data.prompt}` });
    } else {
      if (!parsed.data.image) {
        return reply.code(400).send({ message: 'Image data is required.' });
      }
      parts.push({
        text: 'Extract the style details from this reference image.',
      });
      parts.push({
        inlineData: {
          data: stripDataUrlPrefix(parsed.data.image.data),
          mimeType: parsed.data.image.mimeType,
        },
      });
    }

    try {
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
      });

      const text = result.response.text();
      const extracted = extractJsonFromText(text);
      return { style: extracted };
    } catch (err) {
      return reply.code(500).send({
        message: 'Failed to extract style with Gemini.',
      });
    }
  });

  fastify.post('/styles/preview', async (request, reply) => {
    const parsed = previewSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Invalid preview payload.' });
    }

    const integration = await getIntegrationSettings();
    if (!integration?.gemini?.enabled || !integration.gemini.apiKey) {
      return reply
        .code(400)
        .send({ message: 'Gemini integration is not configured.' });
    }

    const prompt = parsed.data.prompt.trim();
    const negativePrompt = parsed.data.negativePrompt?.trim();
    const fullPrompt = negativePrompt
      ? `${prompt}\nNegative prompt: ${negativePrompt}`
      : prompt;

    try {
      const genAI = new GoogleGenerativeAI(integration.gemini.apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3-pro-image-preview',
      });

      let response: any;
      try {
        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        } as any);
        response = result.response as any;
      } catch (err) {
        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: fullPrompt }],
            },
          ],
        } as any);
        response = result.response as any;
      }

      const parts = response?.candidates?.[0]?.content?.parts ?? [];
      const inline =
        parts.find((part: any) => part.inlineData)?.inlineData ??
        parts.find((part: any) => part.inline_data)?.inline_data;

      if (!inline?.data) {
        return reply.code(502).send({ message: 'Invalid image response.' });
      }

      const mimeType = inline.mimeType ?? inline.mime_type ?? 'image/png';
      const dataUrl = `data:${mimeType};base64,${inline.data}`;
      return { dataUrl };
    } catch (err) {
      if (err instanceof GoogleGenerativeAIFetchError) {
        fastify.log.error({ err }, 'Gemini image generation failed');
        return reply
          .code(502)
          .send({ message: 'Image generation failed.' });
      }
      fastify.log.error({ err }, 'Failed to generate preview image');
      return reply.code(500).send({ message: 'Failed to generate preview.' });
    }
  });

  fastify.delete('/styles/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const removed = await deleteComicStyle(id);
    if (!removed) {
      return reply.code(404).send({ message: 'Style not found' });
    }
    return { ok: true };
  });
}
