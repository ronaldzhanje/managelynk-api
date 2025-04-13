import { Module } from '@nestjs/common';
import { FileStorageService } from './services/file-storage.service';

@Module({
  providers: [FileStorageService],
  exports: [FileStorageService]  // Export the service so other modules can use it
})
export class CommonModule {} 