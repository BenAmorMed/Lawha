import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
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

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Index() // Optimized for sorting and filtering by price
  @Column({ name: 'current_price', type: 'decimal', precision: 10, scale: 2 })
  currentPrice: number;

  @Index() // Optimized for filtering by category
  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Index() // Optimized for sorting by rating
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Index() // Optimized for sorting by popularity
  @Column({ name: 'reviews_count', type: 'int', default: 0 })
  reviewsCount: number;

  @Column({ name: 'is_special', type: 'boolean', default: false })
  isSpecial: boolean;

  @Column({ name: 'shipping_free', type: 'boolean', default: false })
  shippingFree: boolean;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  @Index() // Optimized for filtering active products
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
