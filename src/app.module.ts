import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { VendorModule } from './vendor/vendor.module';
import { WorkOrderModule } from './work_order/work_order.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    DatabaseModule,
    VendorModule,
    WorkOrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
