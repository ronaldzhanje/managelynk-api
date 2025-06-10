import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ChatSession } from './types/chat-session.type';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async createSession(sessionId: string, data: ChatSession): Promise<void> {
    try {
      await this.client.set(
        `chat:session:${sessionId}`,
        JSON.stringify(data),
        'EX',
        this.configService.get<number>('REDIS_TTL'),
      );
    } catch (error) {
      this.logger.error(`Error creating session ${sessionId}:`, error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const data = await this.client.get(`chat:session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Error getting session ${sessionId}:`, error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.client.del(`chat:session:${sessionId}`);
    } catch (error) {
      this.logger.error(`Error deleting session ${sessionId}:`, error);
      throw error;
    }
  }

  async refreshSession(sessionId: string): Promise<void> {
    try {
      await this.client.expire(
        `chat:session:${sessionId}`,
        this.configService.get<number>('REDIS_TTL'),
      );
    } catch (error) {
      this.logger.error(`Error refreshing session ${sessionId}:`, error);
      throw error;
    }
  }

  async isWorkOrderInSession(workOrderId: number): Promise<boolean> {
    try {
      const sessions = await this.client.keys('chat:session:*');
      for (const sessionKey of sessions) {
        const session = await this.getSession(sessionKey.replace('chat:session:', ''));
        if (session?.work_order_id === workOrderId) {
          return true;
        }
      }
      return false;
    } catch (error) {
      this.logger.error(`Error checking work order ${workOrderId} session status:`, error);
      throw error;
    }
  }
}
