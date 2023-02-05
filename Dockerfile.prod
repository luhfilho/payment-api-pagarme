FROM node:12-alpine

RUN apk add git

RUN mkdir /app/

WORKDIR /app/

COPY ./src /app/
RUN npm install

EXPOSE 1580
ENTRYPOINT ["npm", "run", "start"]