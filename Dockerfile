
FROM node:carbon

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD PORT=$PORT \
    APOLLO_ENGINE_API_KEY=$APOLLO_ENGINE_API_KEY \
    MONGO_HOST=$MONGO_HOST \
    EGO_API_ROOT=$EGO_API_ROOT \
    ES_HOST=$ES_HOST \
    ES_PORT=$ES_PORT \
    ES_API_VERSION=$ES_API_VERSION \
    ES_LOG_LEVEL=$ES_LOG_LEVEL \
    yarn start
