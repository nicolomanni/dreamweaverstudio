# Firebase Hosting Deployment (Frontend)

This deploys the React/Vite app (`apps/client`) to Firebase Hosting.

## Prerequisites
- Firebase project created
- Firebase CLI installed (`npm i -g firebase-tools`)
- `firebase login`

## Configure Project
Edit `.firebaserc` and set your project id:
```json
{
  "projects": {
    "default": "<FIREBASE_PROJECT_ID>"
  }
}
```

## Build + Deploy
```bash
npm run deploy:client
```

## Notes
- Build output is `dist/apps/client`.
- `firebase.json` includes SPA rewrites to `index.html`.
