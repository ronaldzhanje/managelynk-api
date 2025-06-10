export interface MessageContent {
  type: 'text' | 'ai_response';  // Expandable for future types
  content: string;
  metadata?: {
    model?: string;
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class Message {
  id: number;
  work_order_id: number;
  user_id: number | null;  // null for AI messages
  message: MessageContent;
  created_at: Date;
  updated_at: Date;
}
