FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./
RUN yarn

COPY . .
RUN yarn build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["yarn", "start"]