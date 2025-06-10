import { Module } from '@nestjs/common';
import { WorkOrderController } from './work_order.controller';
import { WorkOrderService } from './work_order.service';
import { DatabaseModule } from '../database/database.module';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    ConfigModule,
    RedisModule
  ],
  controllers: [WorkOrderController],
  providers: [WorkOrderService],
})
export class WorkOrderModule {} 