import { Module } from '@nestjs/common';
import { WorkOrderController } from './work_order.controller';
import { WorkOrderService } from './work_order.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WorkOrderController],
  providers: [WorkOrderService],
})
export class WorkOrderModule {} 