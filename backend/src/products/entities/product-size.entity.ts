import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../product.entity';

@Entity('product_sizes')
export class ProductSize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.sizes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'varchar', length: 50 })
  label: string;

  @Column({ name: 'width_cm', type: 'numeric', precision: 6, scale: 2 })
  widthCm: number;

  @Column({ name: 'height_cm', type: 'numeric', precision: 6, scale: 2 })
  heightCm: number;

  @Column({ name: 'price_delta', type: 'numeric', precision: 10, scale: 2, default: 0 })
  priceDelta: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
