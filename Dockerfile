FROM node:20.18-bullseye-slim

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3005

CMD [ "npm", "start" ]