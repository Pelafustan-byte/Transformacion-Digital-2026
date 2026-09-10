FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server.js ./server.js
COPY public ./public
COPY seed ./seed
RUN mkdir -p data/uploads
EXPOSE 3000
CMD ["node","server.js"]
