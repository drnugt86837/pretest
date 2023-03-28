import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {RedisInstance} from "../db/redis";

@Injectable()
export class RateLimitingGuard implements CanActivate {
  private readonly ipMap = new Map();
  private readonly userIdMap = new Map();

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const userId = request.query.userId;
    const now = Date.now();

    // const redis = await RedisInstance.initRedis('TokenGuard.canActivate', 0);
    // await redis.setex('test1', 300, now);
    // await redis.get('test1')

    const ipCount = this.calcCount(ip, now, this.ipMap);
    const userIdCount = this.calcCount(userId, now, this.userIdMap);

    if (ipCount > 10 || userIdCount > 5) {
      throw new HttpException(
        {
          ip: ipCount,
          id: userIdCount,
        },
        429,
      );
    }
    return true;
  }

  private calcCount(key, now, map) {
    if (!key) {
      return 'no user';
    }

    map.forEach((item, key) => {
      if (now > item.time + 60 * 1000) {
        map.delete(key);
      }
    });

    const target = map.get(key);
    const time = target?.time;
    let count = target?.count || 0;
    count++;
    map.set(key, {
      count: count,
      time: time ? time : now,
    });
    return count;
  }
}
