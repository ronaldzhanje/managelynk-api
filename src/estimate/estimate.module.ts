import { Module } from '@nestjs/common';
import { EstimateController } from './estimate.controller';
import { EstimateService } from './estimate.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if JwtAuthGuard needs dependencies from it

@Module({
  imports: [
    DatabaseModule,
    AuthModule // Ensure AuthModule is imported if JwtAuthGuard relies on it
  ],
  controllers: [EstimateController],
  providers: [EstimateService],
  exports: [EstimateService] // Optional: export if other modules need this service
})
export class EstimateModule {} 