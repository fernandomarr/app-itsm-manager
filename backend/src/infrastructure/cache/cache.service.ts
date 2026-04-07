import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class CacheService {
  private readonly defaultTTL = 300; // 5 minutes

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: RedisClientType,
  ) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.redisClient.set(key, serialized, {
      EX: ttl || this.defaultTTL,
    });
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  /**
   * Get cache key for tenant-scoped data
   */
  getTenantKey(tenantId: string, entity: string, id?: string): string {
    return id
      ? `tenant:${tenantId}:${entity}:${id}`
      : `tenant:${tenantId}:${entity}`;
  }

  /**
   * Invalidate all cache for a tenant
   */
  async invalidateTenant(tenantId: string): Promise<void> {
    const pattern = `tenant:${tenantId}:*`;
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }
}
