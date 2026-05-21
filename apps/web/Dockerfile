FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/web/package.json ./apps/web/package.json

RUN yarn install --frozen-lockfile

COPY apps/web ./apps/web

RUN yarn workspace @almoxpert/web build

FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"]