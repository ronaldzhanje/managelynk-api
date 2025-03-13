import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Vendor } from './vendor.entity';
import { VendorDto } from './vendor.dto';

interface VendorFilter {
  serviceType?: string;
  limit?: number;
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
    return this.knex('vendors').where({ id }).update(data);
  }

  async deleteVendor(id: number): Promise<number> {
    return this.knex('vendors').where({ id }).delete();
  }

  async getAllVendors(filter: VendorFilter): Promise<VendorDto[]> {
    const query = this.knex('vendors').select('*');

    if (filter?.serviceType) {
      query.where('serviceType', 'like', `%${filter.serviceType}%`);
    }
    
    if (filter?.limit) {
      query.limit(filter.limit);
    }
    
    return await query;
  }
}
