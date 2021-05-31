FROM node:14 as base

WORKDIR /app

RUN apt-get update
RUN apt-get -y install apt-transport-https ca-certificates

COPY ./package.json .
COPY ./cli.js .
COPY ./server.js .
RUN npm i

COPY ./plugins/ .
