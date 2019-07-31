FROM node:alpine

WORKDIR /srv/app

COPY . .

CMD [ "npm", "run", "start:debug" ]
