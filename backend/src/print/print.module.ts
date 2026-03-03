import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Order } from '../orders/order.entity';
import { PrintWorkerService } from './print-worker.service';
import { PrintWorkerProcessor } from './print-worker.processor';
import { PrintController } from './print.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    BullModule.registerQueue({
      name: 'print',
    }),
    StorageModule,
  ],
  providers: [PrintWorkerService, PrintWorkerProcessor],
  controllers: [PrintController],
  exports: [PrintWorkerService],
})
export class PrintModule {}
