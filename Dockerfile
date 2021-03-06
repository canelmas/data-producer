FROM node:10.15.3
LABEL maintainer="Can Elmas <canelm@gmail.com>"

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist/ .

CMD ["node", "app.js"]