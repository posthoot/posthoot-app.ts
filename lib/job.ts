import { Cleo } from "@cleotasks/core";

const cleo = Cleo.getInstance();

cleo.configure({
  redis: {
    host: process.env.CLEO_REDIS_HOST,
    port: parseInt(process.env.CLEO_REDIS_PORT),
    db: parseInt(process.env.CLEO_REDIS_DB),
    password: process.env.REDIS_PASSWORD,
  },
  worker: {
    concurrency: 10,
  },
});


export default cleo;