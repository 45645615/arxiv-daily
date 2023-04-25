FROM node:14

WORKDIR /app

ARG GPT_TOKEN
ARG SLACK_TOKEN

ENV GPT_TOKEN=${GPT_TOKEN}
ENV SLACK_TOKEN=${SLACK_TOKEN}

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "index.js" ]
