import { Queue } from "bullmq";
import * as IORedis from "ioredis";

const redisConfig: IORedis.RedisOptions = {
  host: "127.0.0.1",
  port: 6379,
};
const connection = new IORedis.Redis(redisConfig);
export const emailQueue = new Queue("emailQueue", { connection });
