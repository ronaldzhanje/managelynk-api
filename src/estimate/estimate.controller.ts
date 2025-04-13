import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EstimateService } from './estimate.service';
import { EstimateDto, EstimateResponseDto } from './estimate.dto';
import { FileStorageService } from '../common/services/file-storage.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Estimates')
@Controller('estimates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EstimateController {
  constructor(
    private readonly estimateService: EstimateService,
    private readonly fileStorageService: FileStorageService,
    private readonly configService: ConfigService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new estimate with optional file upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['estimateData'],
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        },
        estimateData: {
          type: 'object',
          properties: {
            work_order_id: { type: 'number' },
            vendor_id: { type: 'number' },
            cost: { type: 'number' },
            // ... other EstimateDto properties
          },
          required: ['work_order_id', 'vendor_id', 'cost']
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Estimate created successfully.', type: EstimateResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(pdf|jpeg|png|jpg)$/)) {
        return cb(new Error('Only PDF and images are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async createEstimate(
    @Body('estimateData') estimateData: string,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<EstimateResponseDto> {
    const parsedEstimateData: EstimateDto = typeof estimateData === 'string' 
      ? JSON.parse(estimateData)
      : estimateData;

    return this.estimateService.createEstimateWithFile(parsedEstimateData, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all estimates, optionally filtered' })
  @ApiQuery({ name: 'work_order_id', required: false, type: Number, description: 'Filter by Work Order ID' })
  @ApiQuery({ name: 'vendor_id', required: false, type: Number, description: 'Filter by Vendor ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit the number of results' })
  @ApiResponse({ status: 200, description: 'List of estimates retrieved successfully.', type: [EstimateResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllEstimates(
    @Query('work_order_id') work_order_id?: number,
    @Query('vendor_id') vendor_id?: number,
    @Query('limit') limit?: number,
  ): Promise<EstimateResponseDto[]> {
    const filters = {
        work_order_id: work_order_id ? +work_order_id : undefined,
        vendor_id: vendor_id ? +vendor_id : undefined,
        limit: limit ? +limit : undefined
    };
    return this.estimateService.getAllEstimates(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific estimate by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the estimate to retrieve', type: Number })
  @ApiResponse({ status: 200, description: 'Estimate retrieved successfully.', type: EstimateResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Estimate not found' })
  async getEstimate(@Param('id', ParseIntPipe) id: number): Promise<EstimateResponseDto> {
    return this.estimateService.getEstimate(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing estimate by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'The ID of the estimate to update', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        },
        estimateData: {
          type: 'object',
          properties: {
            work_order_id: { type: 'number' },
            vendor_id: { type: 'number' },
            cost: { type: 'number' },
            // ... other EstimateDto properties
          }
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Estimate updated successfully.', type: EstimateResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Estimate not found' })
  @UseInterceptors(FileInterceptor('file'))
  async updateEstimate(
    @Param('id') id: number,
    @Body('estimateData') estimateDataString: string,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<EstimateResponseDto> {
    const estimateData = JSON.parse(estimateDataString);
    return this.estimateService.updateEstimateWithFile(id, estimateData, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an estimate by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the estimate to delete', type: Number })
  @ApiResponse({ status: 200, description: 'Estimate deleted successfully.', schema: { example: { success: true, message: 'Estimate with ID 1 deleted successfully.' } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Estimate not found' })
  async deleteEstimate(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean; message: string }> {
    return this.estimateService.deleteEstimate(id);
  }
} 