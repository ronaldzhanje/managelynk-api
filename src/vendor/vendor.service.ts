import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Vendor } from './vendor.entity';
import { VendorDto } from './vendor.dto';

interface VendorFilter {
  licenseType?: string;
  licenseStatus?: string;
  limit?: number;
  qualifier?: string;
  businessName?: string;
  city?: string;
}

@Injectable()
export class VendorService {
  constructor(@Inject('KNEX_CONNECTION') private knex: Knex) {}

  async createVendor(data: Partial<Vendor>): Promise<number[]> {
    return this.knex('vendors').insert(data).returning('id');
  }

  async getVendor(id: number): Promise<Vendor> {
    return this.knex('vendors').where({ id }).first();
  }

  async updateVendor(id: number, data: Partial<Vendor>): Promise<number> {
    // Create a copy of the data to avoid modifying the original
    const updateData = { ...data };
    
    // Stringify JSON fields if they exist
    if (updateData.qualifier) {
      updateData.qualifier = JSON.stringify(updateData.qualifier);
    }
    if (updateData.services) {
      updateData.services = JSON.stringify(updateData.services);
    }
    
    return this.knex('vendors').where({ id }).update(updateData);
  }

  async deleteVendor(id: number): Promise<number> {
    return this.knex('vendors').where({ id }).delete();
  }

  async getAllVendors(filter: VendorFilter): Promise<VendorDto[]> {
    const query = this.knex('vendors').select('*');

    if (filter?.licenseType) {
      query.where('licenseType', 'like', `%${filter.licenseType}%`);
    }

    if (filter?.licenseStatus) {
      query.where('licenseStatus', filter.licenseStatus);
    }
    
    if (filter?.qualifier) {
      query.whereRaw("qualifier::text ILIKE ?", [`%${filter.qualifier}%`]);
    }
    
    if (filter?.businessName) {
      query.where('businessName', 'like', `%${filter.businessName}%`);
    }
    
    if (filter?.city) {
      query.where('city', 'like', `%${filter.city}%`);
    }
    
    const limit = filter?.limit || 10;
    query.limit(limit);
    
    return await query;
  }
}
