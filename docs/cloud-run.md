# Cloud Run Deployment (DreamWeaverStudio Server)

This guide deploys the Fastify server (`apps/server`) to Google Cloud Run.

## Prerequisites
- Google Cloud project created
- `gcloud` CLI installed and authenticated
- Billing enabled
- Artifact Registry or Container Registry enabled

## Build and Push the Image
```bash
gcloud builds submit --tag gcr.io/<PROJECT_ID>/dreamweaver-server -f apps/server/Dockerfile .
```

## Deploy to Cloud Run
```bash
gcloud run deploy dreamweaver-server \
  --image gcr.io/<PROJECT_ID>/dreamweaver-server \
  --platform managed \
  --region <REGION> \
  --allow-unauthenticated \
  --set-env-vars HOST=0.0.0.0,PORT=8080,MONGO_URI=...,GEMINI_API_KEY=...,STRIPE_SECRET=...,STRIPE_WEBHOOK_SECRET=...
```

## Recommended: Secret Manager
See `docs/cloud-run-secrets.md` for deploying with Secret Manager.

## Optional: Use Artifact Registry
```bash
gcloud artifacts repositories create dreamweaver \
  --repository-format=docker \
  --location <REGION> \
  --description "DreamWeaver containers"
```

Then build with:
```bash
gcloud builds submit --tag <REGION>-docker.pkg.dev/<PROJECT_ID>/dreamweaver/dreamweaver-server -f apps/server/Dockerfile .
```

## Notes
- Cloud Run expects `PORT=8080`.
- Keep secrets in env vars or Secret Manager.
- Webhooks (Stripe) should target the Cloud Run service URL.
