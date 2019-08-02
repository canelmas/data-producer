FROM node:10.15.3
LABEL maintainer="Can Elmas <canelm@gmail.com>"

WORKDIR /app
COPY . .
RUN npm install && npm run build

CMD ["node", "dist/index.js"]
