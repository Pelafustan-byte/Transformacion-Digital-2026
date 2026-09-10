FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY admin ./admin
COPY vite.config.js ./vite.config.js
COPY public ./public
RUN npm run build && npm prune --omit=dev
ENV NODE_ENV=production
COPY server.js ./server.js
COPY seed ./seed
RUN mkdir -p data/uploads
EXPOSE 3000
CMD ["node","server.js"]
