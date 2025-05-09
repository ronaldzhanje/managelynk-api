import { WorkOrderStatus } from './dto/work_order_status.enum';

export { WorkOrderStatus };

export interface WorkOrder {
  id?: number;
  description: string;
  location: string;
  images?: string; // JSON string of image URLs
  user_id: number;
  status: WorkOrderStatus;
  scheduled_date?: string | Date;
  created_at?: Date;
  updated_at?: Date;
} 