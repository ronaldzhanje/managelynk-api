import { WorkOrderStatus } from './dto/work_order_status.enum';

export interface WorkOrder {
  id?: number;
  description: string;
  location: string;
  photo?: string;
  user_id: number;
  status: WorkOrderStatus;
  scheduled_date?: string | Date;
  created_at?: Date;
  updated_at?: Date;
} 