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
  UploadedFiles,
  Request,
  NotFoundException,
  ForbiddenException,
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
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Work Orders')
@Controller('work-orders')
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
        description: {
          type: 'string',
          example: 'The faucet is old and leaking; I want a new fixture installed.',
        },
        location: { type: 'string', example: '10001' },
        scheduled_date: { 
          type: 'string', 
          example: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          format: 'date' 
        },
        images: { 
          type: 'array',
          items: { type: 'string', format: 'binary' }
        },
      },
      required: ['description', 'location'],
    },
  })
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      limits: { fileSize: 50 * 1024 * 1024 },
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
    @UploadedFiles() images: Express.Multer.File[],
    @Request() req,
  ) {
    const user = req.user;
    return this.workOrderService.createWorkOrder(
      createWorkOrderDto,
      user.userId,
      images,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all work orders' })
  async getWorkOrders(@Request() req) {
    return this.workOrderService.getAllWorkOrders(req.user.userId, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a work order by id' })
  async getWorkOrder(@Param('id') id: number, @Request() req) {
    const user = req.user;
    const workOrder = await this.workOrderService.getWorkOrderById(id);
    
    // Allow admin to see any work order, regular users can only see their own
    if (user.role !== 'ADMIN' && workOrder.user_id !== user.userId) {
      throw new ForbiddenException('You do not have permission to view this work order');
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
        description: { type: 'string', example: 'Updated description of the job.' },
        location: { type: 'string', example: '10001' },
        status: { type: 'string', example: 'Work in Progress' },
        scheduled_date: { type: 'string', example: '2024-01-15', format: 'date' },
        images: { 
          type: 'array',
          items: { type: 'string', format: 'binary' }
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      limits: { fileSize: 50 * 1024 * 1024 },
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
    @UploadedFiles() images: Express.Multer.File[],
    @Request() req,
  ) {
    const user = req.user;
    return this.workOrderService.updateWorkOrder(
      id,
      updateWorkOrderDto,
      user.userId,
      images,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a work order' })
  async deleteWorkOrder(@Param('id') id: number, @Request() req) {
    const user = req.user;
    return this.workOrderService.deleteWorkOrder(id, user.userId);
  }
} 