# Firebase App Hosting (Decision)

We are **not** using Firebase App Hosting for the current Vite SPA.

Reason: App Hosting is designed for supported SSR frameworks (e.g. Next.js). The current frontend is a Vite-built SPA, so Firebase Hosting is the correct deployment target.

## If you want App Hosting anyway
We need to migrate the frontend to a supported SSR framework (Next.js is the most direct path). After that, we can:
- Create the App Hosting backend in Firebase
- Configure build/run settings for Next.js
- Deploy via `firebase deploy --only apphosting`

If you want me to proceed with the Next.js migration, say so and I’ll do it.
