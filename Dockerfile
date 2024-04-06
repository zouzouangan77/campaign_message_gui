FROM node:lts-alpine3.19

RUN mkdir -p /home/node/app/.uploads && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY dist ./
COPY node_modules ./

USER node

RUN npx playwright install

# COPY --chown=node:node . .

ENV PORT=5000
EXPOSE 5000

CMD [ "./start.sh" ]