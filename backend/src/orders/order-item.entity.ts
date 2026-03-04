import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { ProductSize } from '../products/entities/product-size.entity';
import { FrameOption } from '../products/entities/frame-option.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'product_size_id', type: 'uuid' })
  productSizeId: string;

  @Column({ name: 'frame_option_id', type: 'uuid', nullable: true })
  frameOptionId: string;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string;

  @Column({ name: 'design_json', type: 'jsonb', nullable: true })
  designJson: any;

  @Column({ name: 'preview_url', type: 'text', nullable: true })
  previewUrl: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductSize)
  @JoinColumn({ name: 'product_size_id' })
  productSize: ProductSize;

  @ManyToOne(() => FrameOption)
  @JoinColumn({ name: 'frame_option_id' })
  frameOption: FrameOption;
}
