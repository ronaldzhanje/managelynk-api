import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { WorkOrderService } from '../work_order.service';

@Injectable()
export class WorkOrderOwnerGuard implements CanActivate {
  constructor(private readonly workOrderService: WorkOrderService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const workOrderId = parseInt(request.params.workOrderId);

    if (!userId || !workOrderId) {
      return false;
    }

    const workOrder = await this.workOrderService.getWorkOrderById(workOrderId);
    if (!workOrder) {
      return false;
    }

    if (workOrder.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this work order');
    }

    return true;
  }
}
