import elasticsearch from "elasticsearch";

const client = new elasticsearch.Client({
  host: `${process.env.ES_HOST}:${process.env.ES_PORT}`,
  apiVersion: process.env.ES_API_VERSION,
  log: process.env.ES_LOG_LEVEL
});

export default client;
