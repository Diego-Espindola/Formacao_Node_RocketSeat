FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.js ./

ENV DATABASE_URL=postgresql://gym:gym@postgres:5432/gym

RUN npm ci && npx prisma generate

COPY . .

RUN chmod +x docker-entrypoint.sh

EXPOSE 3377

ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
