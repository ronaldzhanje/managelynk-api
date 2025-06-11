import { Module } from '@nestjs/common';
import { FileStorageService } from './services/file-storage.service';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [FileStorageService],
  exports: [FileStorageService, RedisModule]  // Export both FileStorageService and RedisModule
})
export class CommonModule {} 