# Cloud Run + Secret Manager (Recommended)

This setup keeps sensitive values out of the shell and Git.

## 1) Create secrets
```bash
gcloud secrets create MONGO_URI --replication-policy="automatic"
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
gcloud secrets create STRIPE_SECRET --replication-policy="automatic"
```

## 2) Add values
```bash
printf "%s" "$MONGO_URI" | gcloud secrets versions add MONGO_URI --data-file=-
printf "%s" "$GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
printf "%s" "$STRIPE_SECRET" | gcloud secrets versions add STRIPE_SECRET --data-file=-
```

## 3) Grant Cloud Run access to secrets
```bash
gcloud secrets add-iam-policy-binding MONGO_URI \
  --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding STRIPE_SECRET \
  --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

```

## 4) Deploy using secrets
```bash
npm run deploy:server:secrets
```

Then deploy the frontend:
```bash
npm run deploy:client
```

Or both:
```bash
npm run deploy:all:secrets
```

## Notes
- Cloud Run expects `PORT=8080`.
- Replace `<PROJECT_NUMBER>` with your GCP project number.
