# syntax=docker/dockerfile:1
# GUÍA: Etapa 1: Node compila React a archivos estáticos usando el lockfile original.
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,id=huertohogar-npm,target=/root/.npm,sharing=locked \
    npm ci --include=optional --no-audit --no-fund
COPY . .
# El navegador accede a /api del mismo origen; Nginx reenvía al backend.
ENV VITE_API_URL=""
RUN npm test && npm run build

# GUÍA: Etapa 2: Nginx sirve la aplicación compilada, sin Node en ejecución.
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
