FROM node:16-alpine

WORKDIR /app

COPY package*.json .
RUN npm install

COPY src/ ./src

USER node
EXPOSE 3000

CMD ["npm", "run", "start"]