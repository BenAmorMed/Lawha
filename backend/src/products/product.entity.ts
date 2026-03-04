import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from '../orders/order-item.entity';
import { ProductSize } from './entities/product-size.entity';
import { FrameOption } from './entities/frame-option.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'varchar', length: 100 })
  category: string; // e.g., 'canvas', 'poster', 'acrylic'

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => ProductSize, (size) => size.product)
  sizes: ProductSize[];

  @OneToMany(() => FrameOption, (frame) => frame.product)
  frames: FrameOption[];
}
