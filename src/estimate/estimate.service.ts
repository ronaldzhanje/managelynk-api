import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { EstimateDto, EstimateResponseDto } from './estimate.dto';
import { FileStorageService } from '../common/services/file-storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EstimateService {
  constructor(
    @Inject('KNEX_CONNECTION') private knex: Knex,
    private readonly fileStorageService: FileStorageService,
    private readonly configService: ConfigService
  ) {}

  async transaction<T>(operation: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    return this.knex.transaction(async (trx) => {
      try {
        const result = await operation(trx);
        return result;
      } catch (error) {
        throw error;
      }
    });
  }

  async createEstimate(estimateData: EstimateDto, trx?: Knex.Transaction): Promise<EstimateResponseDto> {
    const queryBuilder = trx || this.knex;
    const [newEstimate] = await queryBuilder('estimates')
      .insert(estimateData)
      .returning('*');
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

    const estimates = await query;

    // Generate signed URLs for all estimates with files
    return Promise.all(estimates.map(async (estimate) => {
      if (estimate.fileUrl) {
        const fileKey = estimate.fileUrl.replace(
          `${this.configService.get<string>('DO_SPACES_ENDPOINT')}/`,
          ''
        );
        estimate.fileUrl = await this.fileStorageService.getSignedUrl(fileKey, 3600);
      }
      return estimate;
    }));
  }

  async getEstimate(id: number, trx?: Knex.Transaction): Promise<EstimateResponseDto> {
    const queryBuilder = trx || this.knex;
    const estimate = await queryBuilder('estimates')
      .where({ id })
      .first();
    
    if (!estimate) {
      throw new NotFoundException(`Estimate with ID ${id} not found.`);
    }

    // Generate signed URL if file exists
    if (estimate.fileUrl) {
      const fileKey = estimate.fileUrl.replace(
        `${this.configService.get<string>('DO_SPACES_ENDPOINT')}/`,
        ''
      );
      estimate.fileUrl = await this.fileStorageService.getSignedUrl(fileKey, 3600);
    }

    return estimate;
  }

  async updateEstimate(id: number, estimateData: Partial<EstimateDto>, trx?: Knex.Transaction): Promise<EstimateResponseDto> {
    const queryBuilder = trx || this.knex;
    const [updatedEstimate] = await queryBuilder('estimates')
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

  async createEstimateWithFile(
    estimateData: EstimateDto, 
    file?: Express.Multer.File
  ): Promise<EstimateResponseDto> {
    let fileUrl: string | undefined;

    try {
      return await this.transaction(async (trx) => {
        const createdEstimate = await this.createEstimate(estimateData, trx);

        if (file) {
          const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
          const filename = `${nodeEnv}/work_orders/${createdEstimate.work_order_id}/estimates/${createdEstimate.id}/${Date.now()}-${file.originalname}`;
          fileUrl = await this.fileStorageService.uploadFile(
            file.buffer,
            filename,
            file.mimetype
          );
          
          return await this.updateEstimate(createdEstimate.id, {
            ...createdEstimate,
            fileUrl
          }, trx);
        }

        return createdEstimate;
      });
    } catch (error) {
      if (fileUrl) {
        const fileKey = fileUrl.replace(`${this.configService.get<string>('DO_SPACES_ENDPOINT')}/`, '');
        await this.fileStorageService.deleteFile(fileKey).catch(console.error);
      }
      throw error;
    }
  }

  async updateEstimateWithFile(
    id: number,
    estimateData: Partial<EstimateDto>,
    file?: Express.Multer.File
  ): Promise<EstimateResponseDto> {
    let fileUrl: string | undefined;

    try {
      return await this.transaction(async (trx) => {
        const existingEstimate = await this.getEstimate(id, trx);
        
        if (file) {
          const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
          const filename = `${nodeEnv}/work_orders/${existingEstimate.work_order_id}/estimates/${id}/${Date.now()}-${file.originalname}`;
          
          // Delete existing file if present
          if (existingEstimate.fileUrl) {
            const existingFileKey = existingEstimate.fileUrl.replace(
              `${this.configService.get<string>('DO_SPACES_ENDPOINT')}/`,
              ''
            );
            await this.fileStorageService.deleteFile(existingFileKey).catch(console.error);
          }

          fileUrl = await this.fileStorageService.uploadFile(
            file.buffer,
            filename,
            file.mimetype
          );
          
          estimateData.fileUrl = fileUrl;
        }

        return await this.updateEstimate(id, estimateData, trx);
      });
    } catch (error) {
      if (fileUrl) {
        const fileKey = fileUrl.replace(
          `${this.configService.get<string>('DO_SPACES_ENDPOINT')}/`,
          ''
        );
        await this.fileStorageService.deleteFile(fileKey).catch(console.error);
      }
      throw error;
    }
  }
} 