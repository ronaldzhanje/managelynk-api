import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkOrderService } from './work_order.service';
import { CreateWorkOrderDto } from './dto/create_work_order.dto';
import { UpdateWorkOrderDto } from './dto/update_work_order.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('Work Orders')
@Controller('work_orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new work order' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Replace Bathroom Faucet',
        },
        description: {
          type: 'string',
          example:
            'The faucet is old and leaking; I want a new fixture installed. Its a standard 3-hole setup.',
        },
        location: {
          type: 'string',
          example: '10001',
        },
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'description', 'location'],
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async createWorkOrder(
    @Body() createWorkOrderDto: CreateWorkOrderDto,
    @UploadedFile() photo: Express.Multer.File,
    @Request() req,
  ) {
    const user = req.user;
    return this.workOrderService.createWorkOrder(
      createWorkOrderDto,
      user.userId,
      photo,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all work orders for the logged-in user' })
  async getAllWorkOrders(@Request() req) {
    const user = req.user;
    return this.workOrderService.getAllWorkOrders(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a work order by id' })
  async getWorkOrder(@Param('id') id: number, @Request() req) {
    const user = req.user;
    const workOrder = await this.workOrderService.getWorkOrderById(id);
    if (workOrder.user_id !== user.userId) {
      throw new NotFoundException('Work order not found');
    }
    return workOrder;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a work order' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Replace Bathroom Faucet',
        },
        description: {
          type: 'string',
          example: 'Updated description for the work order.',
        },
        location: {
          type: 'string',
          example: '10001',
        },
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async updateWorkOrder(
    @Param('id') id: number,
    @Body() updateWorkOrderDto: UpdateWorkOrderDto,
    @UploadedFile() photo: Express.Multer.File,
    @Request() req,
  ) {
    const user = req.user;
    return this.workOrderService.updateWorkOrder(
      id,
      updateWorkOrderDto,
      user.userId,
      photo,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a work order' })
  async deleteWorkOrder(@Param('id') id: number, @Request() req) {
    const user = req.user;
    return this.workOrderService.deleteWorkOrder(id, user.userId);
  }
} 