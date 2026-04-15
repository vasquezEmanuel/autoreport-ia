FROM node:20-alpine

RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

RUN mkdir -p /app/uploads /app/reports

EXPOSE 3000

CMD ["node", "src/server.js"]