FROM docker.io/node:lts-alpine AS build

WORKDIR /app

COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY apps ./apps
COPY libs ./libs

RUN npm ci
RUN npx nx run server:prune

FROM docker.io/node:lts-alpine

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

WORKDIR /app

COPY --from=build /app/dist/apps/server ./

RUN npm ci --omit=dev

CMD ["node", "main.js"]
