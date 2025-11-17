# PRODUCTION DOCKERFILE
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS base

FROM base AS builder

COPY . /app
ENV NODE_ENV=build

WORKDIR /app

RUN yarn install --immutable --network-timeout 30000 \
  && yarn ci:build \
  && yarn workspaces focus --all --production

# ---

FROM base AS production
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/dist/ dist/
COPY --from=builder /app/node_modules/ node_modules/

EXPOSE 5030

CMD ["node", "dist/main.js"]
