FROM node:20-alpine AS builder
WORKDIR /app
# Only copy package.json to allow the container to resolve and generate a lockfile during build
COPY package.json ./
# Copy remaining source files
COPY . .
# Use npm install (not npm ci) so the image can generate a lockfile if none or out-of-sync
# --no-audit speeds install, --prefer-offline helps with caching
RUN npm install --prefer-offline --no-audit && npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
