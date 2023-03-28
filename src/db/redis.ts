import redisConfig from '../config/redis.config';
import Redis from "ioredis";

const redisIndex = [];
const redisList = [];

export class RedisInstance {
  static async initRedis(method: string, db: number = 0) {
    const isExist = redisIndex.some(x => x === db);
    if (!isExist) {
      redisList[db] = new Redis.Cluster(redisConfig);
      redisIndex.push(db);
    }
    return redisList[db];
  }
}
