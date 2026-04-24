FROM node:24-trixie AS base

FROM base AS pruner

WORKDIR /app
RUN yarn global add turbo@^1.13.0
COPY . .

RUN turbo prune '@orbiting/api-app' --docker

FROM base AS builder

WORKDIR /app

# the turbo.json file is needed as part of some prepare scripts
COPY --from=pruner /app/out/full/turbo.json .
COPY --from=pruner /app/out/json/ .

RUN yarn install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN yarn turbo run build --filter='@orbiting/api-app...' --no-cache
# Prune dev dependencies
RUN yarn install --frozen-lockfile --production --ignore-scripts --prefer-offline

FROM node:24-trixie-slim AS runner

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/api ./apps/api
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages

COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/package.json ./apps/api/package.json

CMD ["node", "apps/api/index.js"]
