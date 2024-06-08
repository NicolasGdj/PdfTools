FROM node:14

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y ghostscript graphicsmagick

COPY src ./

RUN npm install

EXPOSE 3000

CMD ["node", "app.js"]