FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN pnpm

COPY . .

EXPOSE 8000

CMD ["npm", "start"]