import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VendorService } from './vendor.service';
import { VendorDto } from './vendor.dto';

@ApiTags('Professionals')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new professional' })
  @ApiBody({
    schema: {
      example: {
        businessName: "ABC Plumbing",
        primaryContactName: "John Doe",
        serviceType: "Plumbing",
        email: "john@abcplumbing.com",
        phone: "+1234567890",
        service_area: ["Zone1", "Zone2"]
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Professional created successfully',
    schema: {
      example: {
        id: 1,
        businessName: "ABC Plumbing",
        primaryContactName: "John Doe",
        serviceType: "Plumbing",
        email: "john@abcplumbing.com",
        phone: "+1234567890",
        service_area: ["Zone1", "Zone2"]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createProfessional(@Body() professional: VendorDto) {
    console.log('Received professional data:', professional);
    return this.vendorService.createProfessional(professional);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update professional by id' })
  @ApiBody({
    schema: {
      example: {
        businessName: "ABC Plumbing Updated",
        primaryContactName: "John Doe",
        serviceType: "Plumbing & Heating",
        email: "john@abcplumbing.com",
        phone: "+1234567890",
        service_area: ["Zone1", "Zone3"]
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Professional updated successfully',
    schema: {
      example: {
        id: 1,
        businessName: "ABC Plumbing Updated",
        primaryContactName: "John Doe",
        serviceType: "Plumbing & Heating",
        email: "john@abcplumbing.com",
        phone: "+1234567890",
        service_area: ["Zone1", "Zone3"]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Professional not found' })
  async updateProfessional(@Param('id') id: number, @Body() professional: VendorDto) {
    return this.vendorService.updateProfessional(id, professional);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get professional by id' })
  async getProfessional(@Param('id') id: number) {
    return this.vendorService.getProfessional(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete professional by id' })
  async deleteProfessional(@Param('id') id: number) {
    return this.vendorService.deleteProfessional(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all professionals' })
  @ApiResponse({
    status: 200,
    description: 'List of professionals retrieved successfully',
    schema: {
      example: [{
        id: 1,
        businessName: "ABC Plumbing",
        primaryContactName: "John Doe",
        serviceType: "Plumbing",
        email: "john@abcplumbing.com",
        phone: "+1234567890",
        service_area: ["Zone1", "Zone2"]
      }]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'serviceType',
    required: false,
    type: String,
    description: 'Filter professionals by service type'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of records to return'
  })
  async getAllProfessionals(
    @Query('serviceType') serviceType?: string,
    @Query('limit') limit?: number,
  ): Promise<VendorDto[]> {
    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    return this.vendorService.getAllProfessionals({ serviceType, limit });
  }
}
