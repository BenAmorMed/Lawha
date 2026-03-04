import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductSize } from './entities/product-size.entity';
import { FrameOption } from './entities/frame-option.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductSize, FrameOption])],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule { }
