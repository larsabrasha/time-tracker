FROM node:13 as build

RUN apt-get update
RUN apt-get install python

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:13-alpine
COPY --from=build /usr/src/app /usr/src/app

EXPOSE 3000

CMD ["node", "/usr/src/app/index.js"]
