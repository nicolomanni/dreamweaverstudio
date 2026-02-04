# Render Deployment (Frontend + Backend)

Render can host both the Fastify API and the Vite SPA.

## Files
Deployment blueprint lives at:
- `deploy/render.yaml`

Render looks for `render.yaml` at the repository root when you use Blueprint deploy.
If you want to use Blueprint:
- copy `deploy/render.yaml` to `render.yaml` at repo root before connecting, or
- create the services manually in the Render UI using the same settings.

## Backend (Fastify)
Service type: Web Service
- Build: `npm ci --include=dev && npx nx build server`
- Start: `node dist/apps/server/main.js`
- Env vars:
  - `HOST=0.0.0.0`
  - `NODE_ENV=production`
  - `MONGO_URI` (secret)
  - `GEMINI_API_KEY` (secret)
- `STRIPE_SECRET` (secret)
- `CORS_ORIGIN` (optional, comma-separated, e.g. `https://dreamweaverstudio.onrender.com`)

## Frontend (Vite SPA)
Service type: Static Site
- Build: `npm ci --include=dev && npx nx build client`
- Publish dir: `dist/apps/client`
- Redirects: rewrite `/*` to `/index.html`
- Env vars (Static site):
  - `VITE_API_BASE_URL` (URL of the backend, e.g. `https://dreamweaver-server.onrender.com`)

## Notes
- Render will inject `PORT` automatically for the web service.
- Keep the frontend API base URL pointing to the Render backend URL.
