import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { EstimateDto, EstimateResponseDto } from './estimate.dto';

@Injectable()
export class EstimateService {
  constructor(@Inject('KNEX_CONNECTION') private knex: Knex) {}

  async createEstimate(estimateData: EstimateDto): Promise<EstimateResponseDto> {
    // Optional: Add checks to ensure work_order_id and vendor_id exist
    // const workOrderExists = await this.knex('work_orders').where({ id: estimateData.work_order_id }).first();
    // if (!workOrderExists) throw new NotFoundException(`Work Order with ID ${estimateData.work_order_id} not found.`);
    // const vendorExists = await this.knex('vendors').where({ id: estimateData.vendor_id }).first();
    // if (!vendorExists) throw new NotFoundException(`Vendor with ID ${estimateData.vendor_id} not found.`);

    const [newEstimate] = await this.knex('estimates')
      .insert(estimateData)
      .returning('*'); // Return all columns of the newly created row
    return newEstimate;
  }

  async getAllEstimates(filters: { work_order_id?: number, vendor_id?: number, limit?: number }): Promise<EstimateResponseDto[]> {
    const query = this.knex('estimates').select('*');

    if (filters.work_order_id) {
      query.where({ work_order_id: filters.work_order_id });
    }

    if (filters.vendor_id) {
      query.where({ vendor_id: filters.vendor_id });
    }

    if (filters.limit) {
      query.limit(filters.limit);
    }

    return query;
  }

  async getEstimate(id: number): Promise<EstimateResponseDto> {
    const estimate = await this.knex('estimates')
      .where({ id })
      .first();
    if (!estimate) {
      throw new NotFoundException(`Estimate with ID ${id} not found.`);
    }
    return estimate;
  }

  async updateEstimate(id: number, estimateData: Partial<EstimateDto>): Promise<EstimateResponseDto> {
    const [updatedEstimate] = await this.knex('estimates')
      .where({ id })
      .update(estimateData)
      .returning('*');

    if (!updatedEstimate) {
      throw new NotFoundException(`Estimate with ID ${id} not found.`);
    }
    return updatedEstimate;
  }

  async deleteEstimate(id: number): Promise<{ success: boolean; message: string }> {
    const deletedCount = await this.knex('estimates')
      .where({ id })
      .del();

    if (deletedCount === 0) {
      throw new NotFoundException(`Estimate with ID ${id} not found.`);
    }
    return { success: true, message: `Estimate with ID ${id} deleted successfully.` };
  }
} 