FROM node:20.18-bullseye-slim

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3003

CMD [ "npm", "start" ]