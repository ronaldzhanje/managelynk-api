export interface WorkOrder {
  id?: number;
  title: string;
  description: string;
  location: string;
  photo?: string;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
} 