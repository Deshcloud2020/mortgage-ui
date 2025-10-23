FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY . .
RUN npm ci --prefer-offline --no-audit && npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
