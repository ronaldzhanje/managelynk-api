import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ChatSessionGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const workOrderId = parseInt(request.params.workOrderId);
    const sessionId = request.headers['x-session-id'];

    // Starting new chat session
    if (request.path.endsWith('/chat') && request.method === 'POST') {
      if (await this.redisService.isWorkOrderInSession(workOrderId)) {
        throw new ConflictException('Work order already has an active chat session');
      }
      return true;
    }

    // All other chat operations require valid session
    if (!sessionId) {
      throw new UnauthorizedException('No chat session ID provided');
    }

    // Get and verify session
    const session = await this.redisService.getSession(sessionId);
    if (!session) {
      throw new NotFoundException('Chat session not found or has expired');
    }

    // Verify user owns the session
    if (session.user_id !== request.user.id) {
      throw new UnauthorizedException('You do not have access to this chat session');
    }

    // Verify work order matches
    if (session.work_order_id !== workOrderId) {
      throw new UnauthorizedException('Invalid chat session for this work order');
    }

    // For message endpoints, refresh session TTL
    if (request.path.endsWith('/messages')) {
      await this.redisService.refreshSession(sessionId);
    }

    return true;
  }
}
