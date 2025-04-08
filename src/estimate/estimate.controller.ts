import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EstimateService } from './estimate.service';
import { EstimateDto, EstimateResponseDto } from './estimate.dto';

@ApiTags('Estimates')
@Controller('estimates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EstimateController {
  constructor(private readonly estimateService: EstimateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new estimate' })
  @ApiBody({ type: EstimateDto })
  @ApiResponse({ status: 201, description: 'Estimate created successfully.', type: EstimateResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createEstimate(@Body() estimateData: EstimateDto): Promise<EstimateResponseDto> {
    return this.estimateService.createEstimate(estimateData);
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
  @ApiParam({ name: 'id', description: 'The ID of the estimate to update', type: Number })
  @ApiBody({ type: EstimateDto, description: 'Fields to update. Only include fields that need changing.' })
  @ApiResponse({ status: 200, description: 'Estimate updated successfully.', type: EstimateResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Estimate not found' })
  async updateEstimate(
    @Param('id', ParseIntPipe) id: number,
    @Body() estimateData: Partial<EstimateDto>,
  ): Promise<EstimateResponseDto> {
    return this.estimateService.updateEstimate(id, estimateData);
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