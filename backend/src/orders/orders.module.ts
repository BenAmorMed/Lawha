import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { User } from '../auth/entities/user.entity';
import { ProductSize } from '../products/entities/product-size.entity';
import { FrameOption } from '../products/entities/frame-option.entity';
import { PrintJob } from './print-job.entity';
import { EmailModule } from '../email/email.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, User, ProductSize, FrameOption, PrintJob]),
    EmailModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule { }
