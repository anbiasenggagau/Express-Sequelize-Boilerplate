FROM node:20.16.0

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm i -g typescript
RUN npm run build
RUN rm -r ./src

CMD [ "npm","run","start" ]