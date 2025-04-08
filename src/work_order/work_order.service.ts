import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateWorkOrderDto } from './dto/create_work_order.dto';
import { UpdateWorkOrderDto } from './dto/update_work_order.dto';
import { WorkOrder } from './work_order.entity';
import { WorkOrderStatus } from './dto/work_order_status.enum';

@Injectable()
export class WorkOrderService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async createWorkOrder(
    createWorkOrderDto: CreateWorkOrderDto,
    userId: number,
    photo?: Express.Multer.File,
  ): Promise<WorkOrder> {
    const newWorkOrder: Partial<WorkOrder> = {
      description: createWorkOrderDto.description,
      location: createWorkOrderDto.location,
      photo: photo ? photo.filename : null,
      user_id: userId,
      status: WorkOrderStatus.TROUBLESHOOTING,
      scheduled_date: createWorkOrderDto.scheduled_date ? createWorkOrderDto.scheduled_date : null,
    };

    const [insertedWorkOrder] = await this.knex('work_orders')
      .insert(newWorkOrder)
      .returning('*');

    return insertedWorkOrder;
  }

  async getWorkOrderById(id: number): Promise<WorkOrder> {
    const workOrder = await this.knex<WorkOrder>('work_orders')
      .where({ id })
      .first();

    if (!workOrder) {
      throw new NotFoundException(`Work order with id ${id} not found`);
    }
    return workOrder;
  }

  async updateWorkOrder(
    id: number,
    updateWorkOrderDto: UpdateWorkOrderDto,
    userId: number,
    photo?: Express.Multer.File,
  ): Promise<WorkOrder> {
    const workOrder = await this.getWorkOrderById(id);
    if (workOrder.user_id !== userId) {
      throw new NotFoundException(
        `Work order with id ${id} not found or not owned by user`,
      );
    }

    const updatedData: Partial<WorkOrder> = {
      ...updateWorkOrderDto,
      updated_at: new Date(),
    };
    if (photo) {
      updatedData.photo = photo.filename;
    }

    const [updatedWorkOrder] = await this.knex('work_orders')
      .where({ id })
      .update(updatedData)
      .returning('*');

    return updatedWorkOrder;
  }

  async deleteWorkOrder(id: number, userId: number): Promise<{ deleted: boolean }> {
    const workOrder = await this.getWorkOrderById(id);
    if (workOrder.user_id !== userId) {
      throw new NotFoundException(
        `Work order with id ${id} not found or not owned by user`,
      );
    }

    const affectedRows = await this.knex('work_orders')
      .where({ id })
      .delete();

    return { deleted: affectedRows > 0 };
  }

  async getAllWorkOrders(userId?: number): Promise<WorkOrder[]> {
    const query = this.knex<WorkOrder>('work_orders').select('*');
    if (userId) {
      query.where({ user_id: userId });
    }
    return await query;
  }
}