import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { MessageType } from './dto/message.dto';
import { CreateWorkOrderDto } from './dto/create_work_order.dto';
import { UpdateWorkOrderDto } from './dto/update_work_order.dto';
import { WorkOrder } from './work_order.entity';
import { WorkOrderStatus } from './dto/work_order_status.enum';
import { FileStorageService } from '../common/services/file-storage.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../common/redis/redis.service';
import { Role } from '../common/enums/role.enum';
import { StartWorkOrderDto } from './dto/start_work_order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WorkOrderService {
  async startWorkOrder(startWorkOrderDto: StartWorkOrderDto, userId: number) {
    const sessionId = uuidv4();

    return await this.knex.transaction(async (trx) => {
      // 1. Create work order
      const [workOrder] = await trx('work_orders')
        .insert({
          description: startWorkOrderDto.initialMessage, // Use initialMessage as description
          user_id: userId,
          status: WorkOrderStatus.DRAFT,
          location: null // Make location nullable
        })
        .returning('id');

      // 2. Create initial message
      const [message] = await trx('messages')
        .insert({
          work_order_id: workOrder.id,
          user_id: userId,
          message: JSON.stringify({
            type: 'text',
            content: startWorkOrderDto.initialMessage
          })
        })
        .returning(['id', 'message', 'created_at']);

      // 3. Start Redis chat session
      await this.redisService.createSession(sessionId, {
        work_order_id: workOrder.id,
        user_id: userId
      });

      return {
        sessionId,
        workOrderId: workOrder.id,
        message: {
          id: message.id,
          message: message.message,
          created_at: message.created_at
        }
      };
    });
  }
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly fileStorageService: FileStorageService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService
  ) {}

  async transaction<T>(operation: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    return this.knex.transaction(async (trx) => {
      try {
        const result = await operation(trx);
        return result;
      } catch (error) {
        throw error;
      }
    });
  }

  async createWorkOrder(
    createWorkOrderDto: CreateWorkOrderDto,
    userId: number,
    images?: Express.Multer.File[],
  ): Promise<WorkOrder> {
    let imageUrls: string[] = [];

    try {
      return await this.transaction(async (trx) => {
        const newWorkOrder: Partial<WorkOrder> = {
          description: createWorkOrderDto.description,
          location: createWorkOrderDto.location,
          user_id: userId,
          status: WorkOrderStatus.DRAFT,
          scheduled_date: createWorkOrderDto.scheduled_date ? createWorkOrderDto.scheduled_date : null,
          images: '[]', // Initialize as empty array
        };

        const [insertedWorkOrder] = await trx('work_orders')
          .insert(newWorkOrder)
          .returning('*');

        if (images && images.length > 0) {
          const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
          imageUrls = await Promise.all(
            images.map(async (image) => {
              const filename = `${nodeEnv}/work_orders/${insertedWorkOrder.id}/images/${Date.now()}-${image.originalname}`;
              return await this.fileStorageService.uploadFile(
                image.buffer,
                filename,
                image.mimetype
              );
            })
          );

          await trx('work_orders')
            .where({ id: insertedWorkOrder.id })
            .update({ images: JSON.stringify(imageUrls) });

          insertedWorkOrder.images = JSON.stringify(imageUrls);
        }

        return insertedWorkOrder;
      });
    } catch (error) {
      // Clean up uploaded files if transaction fails
      if (imageUrls.length > 0) {
        await Promise.all(
          imageUrls.map(async (url) => {
            const fileKey = url.replace(
              `${this.configService.get<string>('DO_SPACES_ENDPOINT')}/`,
              ''
            );
            await this.fileStorageService.deleteFile(fileKey).catch(console.error);
          })
        );
      }
      throw error;
    }
  }

  async getWorkOrderById(id: number): Promise<WorkOrder> {
    const workOrder = await this.knex<WorkOrder>('work_orders')
      .where({ id })
      .first();

    if (!workOrder) {
      throw new NotFoundException(`Work order with id ${id} not found`);
    }

    // Generate signed URLs for all images
    if (workOrder.images) {
      let imageUrls: string[];
      try {
        // Try to parse as JSON first
        imageUrls = JSON.parse(workOrder.images);
      } catch (e) {
        // If parsing fails, assume it's already an array
        imageUrls = Array.isArray(workOrder.images) ? workOrder.images : [workOrder.images];
      }
      
      const signedUrls = await Promise.all(
        imageUrls.map(async (url: string) => {
          const fileKey = url.replace(
            `${this.configService.get<string>('DO_SPACES_ENDPOINT')}/`,
            ''
          );
          return await this.fileStorageService.getSignedUrl(fileKey, 3600);
        })
      );
      workOrder.images = JSON.stringify(signedUrls);
    }

    return workOrder;
  }

  async updateWorkOrder(
    id: number,
    updateWorkOrderDto: UpdateWorkOrderDto,
    userId: number,
    images?: Express.Multer.File[],
  ): Promise<WorkOrder> {
    const workOrder = await this.getWorkOrderById(id);
    if (workOrder.user_id !== userId) {
      throw new NotFoundException(
        `Work order with id ${id} not found or not owned by user`,
      );
    }

    let newImageUrls: string[] = [];

    try {
      return await this.transaction(async (trx) => {
        const updatedData: Partial<WorkOrder> = {
          ...updateWorkOrderDto,
          updated_at: new Date(),
        };

        if (images && images.length > 0) {
          const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
          newImageUrls = await Promise.all(
            images.map(async (image) => {
              const filename = `${nodeEnv}/work_orders/${id}/images/${Date.now()}-${image.originalname}`;
              return await this.fileStorageService.uploadFile(
                image.buffer,
                filename,
                image.mimetype
              );
            })
          );

          // Merge existing images with new ones
          const existingImages = workOrder.images ? JSON.parse(workOrder.images) : [];
          updatedData.images = JSON.stringify([...existingImages, ...newImageUrls]);
        }

        const [updatedWorkOrder] = await trx('work_orders')
          .where({ id })
          .update(updatedData)
          .returning('*');

        return updatedWorkOrder;
      });
    } catch (error) {
      // Clean up uploaded files if transaction fails
      if (newImageUrls.length > 0) {
        await Promise.all(
          newImageUrls.map(async (url) => {
            const fileKey = url.replace(
              `${this.configService.get<string>('DO_SPACES_ENDPOINT')}/`,
              ''
            );
            await this.fileStorageService.deleteFile(fileKey).catch(console.error);
          })
        );
      }
      throw error;
    }
  }

  async deleteWorkOrder(id: number, userId: number): Promise<{ deleted: boolean }> {
    const workOrder = await this.getWorkOrderById(id);
    if (workOrder.user_id !== userId) {
      throw new NotFoundException(
        `Work order with id ${id} not found or not owned by user`,
      );
    }

    // Delete associated files from storage
    if (workOrder.images) {
      const imageUrls = JSON.parse(workOrder.images);
      await Promise.all(
        imageUrls.map(async (url: string) => {
          const fileKey = url.replace(
            `${this.configService.get<string>('DO_SPACES_ENDPOINT')}/`,
            ''
          );
          await this.fileStorageService.deleteFile(fileKey).catch(console.error);
        })
      );
    }

    const affectedRows = await this.knex('work_orders')
      .where({ id })
      .delete();

    return { deleted: affectedRows > 0 };
  }

  async getAllWorkOrders(userId?: number, role?: Role): Promise<WorkOrder[]> {
    let query = this.knex<WorkOrder>('work_orders').select('*');
    if (userId && role !== Role.ADMIN) {
      query = query.where({ user_id: userId });
    }
    const workOrders = await query;

    // Generate signed URLs for all images in all work orders
    return Promise.all(
      workOrders.map(async (workOrder) => {
        if (workOrder.images) {
          let imageUrls: string[];
          try {
            // Try to parse as JSON first
            imageUrls = JSON.parse(workOrder.images);
          } catch (e) {
            // If parsing fails, assume it's already an array
            imageUrls = Array.isArray(workOrder.images) ? workOrder.images : [];
          }
          
          const signedUrls = await Promise.all(
            imageUrls.map(async (url: string) => {
              const fileKey = url.replace(
                `${this.configService.get<string>('DO_SPACES_ENDPOINT')}/`,
                ''
              );
              return await this.fileStorageService.getSignedUrl(fileKey, 3600);
            })
          );
          workOrder.images = JSON.stringify(signedUrls);
        }
        return workOrder;
      })
    );
  }

  async createMessage(workOrderId: number, content: string, userId: number, type: MessageType = MessageType.TEXT) {
    const messageData = {
      type,
      content
    };

    const [message] = await this.knex('messages')
      .insert({
        work_order_id: workOrderId,
        user_id: userId,
        message: JSON.stringify(messageData)
      })
      .returning('*');

    return {
      id: message.id,
      work_order_id: message.work_order_id,
      user_id: message.user_id,
      type: message.message.type,
      content: message.message.content,
      created_at: message.created_at,
      updated_at: message.updated_at
    };
  }

  async getMessages(workOrderId: number, { page, limit }: { page: number; limit: number }) {
    const offset = (page - 1) * limit;

    const [messages, [{ total }]] = await Promise.all([
      this.knex('messages')
        .where({ work_order_id: workOrderId })
        .orderBy('created_at', 'desc')
        .offset(offset)
        .limit(limit)
        .select('*'),
      this.knex('messages')
        .where({ work_order_id: workOrderId })
        .count('* as total')
    ]);

    return {
      messages: messages.map(msg => {
        const parsedMessage = JSON.parse(msg.message);
        return {
          id: msg.id,
          work_order_id: msg.work_order_id,
          user_id: msg.user_id,
          type: parsedMessage.type,
          content: parsedMessage.content,
          metadata: parsedMessage.metadata,
          created_at: msg.created_at,
          updated_at: msg.updated_at
        };
      }),
      total,
      page,
      limit
    };
  }
}