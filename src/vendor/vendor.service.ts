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

  async createProfessional(data: Partial<Vendor>): Promise<number[]> {
    return this.knex('professionals').insert(data).returning('id');
  }

  async getProfessional(id: number): Promise<Vendor> {
    return this.knex('vendors').where({ id }).first();
  }

  async updateProfessional(id: number, data: Partial<Vendor>): Promise<number> {
    return this.knex('vendors').where({ id }).update(data);
  }

  async deleteProfessional(id: number): Promise<number> {
    return this.knex('professionals').where({ id }).delete();
  }

  async getAllProfessionals(filter: VendorFilter): Promise<VendorDto[]> {
    const query = this.knex('professionals').select('*');

    if (filter?.serviceType) {
      query.where('serviceType', 'like', `%${filter.serviceType}%`);
    }
    
    if (filter?.limit) {
      query.limit(filter.limit);
    }
    
    return await query;
  }
}
