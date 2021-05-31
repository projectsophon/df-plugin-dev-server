FROM node:14 as base

WORKDIR /app

RUN apt-get update
RUN apt-get -y install apt-transport-https ca-certificates

COPY . .
RUN npm i
