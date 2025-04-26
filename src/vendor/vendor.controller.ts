import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VendorService } from './vendor.service';
import { VendorDto } from './vendor.dto';

@ApiTags('Vendors')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiBody({
    schema: {
      example: {
        businessName: "ABC Plumbing",
        licenseType: "Contractor",
        licenseNo: "LIC123456",
        licenseStatus: "Active",
        issueDate: "2024-01-01",
        expirationDate: "2025-01-01",
        addrLine1: "123 Main St",
        addrLine2: "Suite 100",
        city: "Anytown",
        state: "CA",
        zipcode: "12345",
        phone: "+1234567890",
        email: "contact@abcplumbing.com",
        primaryContactName: "John Doe",
        services: ["plumbing", "heating"],
        qualifier: ["P200 - General Plumbing contractor"]
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Vendor created successfully',
    schema: {
      example: {
        id: 1,
        businessName: "ABC Plumbing",
        licenseType: "Contractor",
        licenseNo: "LIC123456",
        licenseStatus: "Active",
        issueDate: "2024-01-01",
        expirationDate: "2025-01-01",
        addrLine1: "123 Main St",
        addrLine2: "Suite 100",
        city: "Anytown",
        state: "CA",
        zipcode: "12345",
        phone: "+1234567890",
        email: "contact@abcplumbing.com",
        primaryContactName: "John Doe",
        services: ["plumbing", "heating"],
        qualifier: ["P200 - General Plumbing contractor"]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createVendor(@Body() vendor: VendorDto) {
    console.log('Received vendor data:', vendor);
    return this.vendorService.createVendor(vendor);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vendor by id' })
  @ApiBody({
    schema: {
      example: {
        businessName: "ABC Plumbing Updated",
        licenseType: "Contractor",
        licenseNo: "LIC123456",
        licenseStatus: "Active",
        issueDate: "2024-01-01",
        expirationDate: "2025-01-01",
        addrLine1: "123 Main St",
        addrLine2: "Suite 200",
        city: "Anytown",
        state: "CA",
        zipcode: "12345",
        phone: "+1234567890",
        email: "contact@abcplumbing.com",
        primaryContactName: "John Doe",
        services: ["plumbing", "heating", "emergency", "commercial"],
        qualifier: ["P200 - General Plumbing contractor", "P300 - Commercial Plumbing"]
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Vendor updated successfully',
    schema: {
      example: {
        id: 1,
        businessName: "ABC Plumbing Updated",
        licenseType: "Contractor",
        licenseNo: "LIC123456",
        licenseStatus: "Active",
        issueDate: "2024-01-01",
        expirationDate: "2025-01-01",
        addrLine1: "123 Main St",
        addrLine2: "Suite 200",
        city: "Anytown",
        state: "CA",
        zipcode: "12345",
        phone: "+1234567890",
        email: "contact@abcplumbing.com",
        primaryContactName: "John Doe",
        services: ["plumbing", "heating", "emergency", "commercial"],
        qualifier: ["P200 - General Plumbing contractor", "P300 - Commercial Plumbing"]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async updateVendor(@Param('id') id: number, @Body() vendor: VendorDto) {
    return this.vendorService.updateVendor(id, vendor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by id' })
  @ApiResponse({
    status: 200,
    description: 'Vendor retrieved successfully',
    schema: {
      example: {
        id: 1,
        businessName: "ABC Plumbing",
        licenseType: "Contractor",
        licenseNo: "LIC123456",
        licenseStatus: "Active",
        issueDate: "2024-01-01",
        expirationDate: "2025-01-01",
        addrLine1: "123 Main St",
        addrLine2: "Suite 100",
        city: "Anytown",
        state: "CA",
        zipcode: "12345",
        phone: "+1234567890",
        email: "contact@abcplumbing.com",
        primaryContactName: "John Doe",
        services: ["plumbing", "heating"],
        qualifier: ["P200 - General Plumbing contractor"]
      }
    }
  })
  async getVendor(@Param('id') id: number) {
    return this.vendorService.getVendor(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vendor by id' })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async deleteVendor(@Param('id') id: number) {
    return this.vendorService.deleteVendor(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  @ApiResponse({
    status: 200,
    description: 'List of vendors retrieved successfully',
    schema: {
      example: [{
        id: 1,
        businessName: "ABC Plumbing",
        licenseType: "Contractor",
        licenseNo: "LIC123456",
        licenseStatus: "Active",
        issueDate: "2024-01-01",
        expirationDate: "2025-01-01",
        addrLine1: "123 Main St",
        addrLine2: "Suite 100",
        city: "Anytown",
        state: "CA",
        zipcode: "12345",
        phone: "+1234567890",
        email: "contact@abcplumbing.com",
        primaryContactName: "John Doe",
        services: ["plumbing", "heating"],
        qualifier: ["P200 - General Plumbing contractor"]
      }]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'licenseType',
    required: false,
    type: String,
    description: 'Filter vendors by license type'
  })
  @ApiQuery({
    name: 'licenseStatus',
    required: false,
    type: String,
    description: 'Filter vendors by license status'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of records to return'
  })
  async getAllVendors(
    @Query('licenseType') licenseType?: string,
    @Query('licenseStatus') licenseStatus?: string,
    @Query('limit') limit?: number,
  ): Promise<VendorDto[]> {
    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    return this.vendorService.getAllVendors({ licenseType, licenseStatus, limit });
  }
}
