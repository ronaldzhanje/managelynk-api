import { Module } from '@nestjs/common';
import { WorkOrderController } from './work_order.controller';
import { WorkOrderService } from './work_order.service';
import { DatabaseModule } from '../database/database.module';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    ConfigModule
  ],
  controllers: [WorkOrderController],
  providers: [WorkOrderService],
  exports: [WorkOrderService]
})
export class WorkOrderModule {} 