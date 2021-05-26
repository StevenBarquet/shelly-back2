FROM node:10

# Create app directory
WORKDIR /shelly_store_backend

#Environment variables
ENV NODE_ENV=production
ENV USE_SSL=TRUE
ENV SSL_PATH=/etc/letsencrypt/live/shelly-store.com
ENV PORT=4000
ENV DEBUG=app:*
ENV shelly_store_backend_mpToken=APP_USR-3764181139893912-021917-19f76dc258dc96a8b805be5b88182db5-522092531
ENV shelly_store_backend_mailPass=comic456



# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 4000

CMD [ "node", "index.js" ]