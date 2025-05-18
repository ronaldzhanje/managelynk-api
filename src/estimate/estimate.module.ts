import { Module } from '@nestjs/common';
import { EstimateController } from './estimate.controller';
import { EstimateService } from './estimate.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if JwtAuthGuard needs dependencies from it
import { FileStorageService } from '../common/services/file-storage.service';
import { CommonModule } from '../common/common.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule, // Ensure AuthModule is imported if JwtAuthGuard relies on it
    CommonModule,
    EmailModule
  ],
  controllers: [EstimateController],
  providers: [
    EstimateService,
    FileStorageService  // Add FileStorageService to providers
  ],
  exports: [EstimateService] // Optional: export if other modules need this service
})
export class EstimateModule {} 