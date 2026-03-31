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

  // Index for price filtering and sorting (e.g., priceLowHigh, priceHighLow)
  @Index()
  @Column({ name: 'current_price', type: 'decimal', precision: 10, scale: 2 })
  currentPrice: number;

  // Index for category filtering in catalog
  @Index()
  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  // Index for sorting by top rated products
  @Index()
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  // Index for sorting by popularity (reviews count)
  @Index()
  @Column({ name: 'reviews_count', type: 'int', default: 0 })
  reviewsCount: number;

  // Index for filtering featured/special products
  @Index()
  @Column({ name: 'is_special', type: 'boolean', default: false })
  isSpecial: boolean;

  @Column({ name: 'shipping_free', type: 'boolean', default: false })
  shippingFree: boolean;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  // Index for filtering active products in public catalog
  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Index for sorting by newest products
  @Index()
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
