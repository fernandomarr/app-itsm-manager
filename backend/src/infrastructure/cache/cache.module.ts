import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          url: configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
          socket: {
            reconnectStrategy: (retries) => {
              if (retries > 5) {
                return new Error('Redis max retries reached');
              }
              return Math.min(retries * 100, 3000);
            },
          },
        });

        client.on('error', (err) => console.error('Redis Client Error', err));
        client.on('connect', () => console.log('Redis Client Connected'));

        await client.connect();
        return client as RedisClientType;
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: ['REDIS_CLIENT', CacheService],
})
export class CacheModule {}
