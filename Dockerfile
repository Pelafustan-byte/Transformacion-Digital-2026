FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY admin ./admin
COPY vite.config.js ./vite.config.js
RUN npm run build:admin

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server.js ./server.js
COPY public ./public
COPY --from=build /app/public/admin ./public/admin
COPY seed ./seed
COPY data/uploads/.gitkeep ./data/uploads/.gitkeep
EXPOSE 3000
CMD ["node","server.js"]
