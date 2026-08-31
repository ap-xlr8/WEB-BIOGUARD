FROM node:24-alpine@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:45ce1e2e699234253d1def7baa96218a5d00b498d1ba0cbb1a17b6bdf73d1351
ENV API_UPSTREAM=https://bioguard-api-lkvnq.ondigitalocean.app
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/templates/default.conf.template
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:8080/web-health || exit 1
EXPOSE 8080
