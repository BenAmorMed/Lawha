import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('integer')
  rating: number; // 1-5 stars

  @Column('text')
  title: string;

  @Column('text')
  comment: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column('uuid', { nullable: true })
  user_id: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @Column('uuid')
  product_id: string;

  @ManyToOne(() => Order, { onDelete: 'SET NULL', nullable: true })
  order: Order | null;

  @Column('uuid', { nullable: true })
  order_id: string;

  @Column('boolean', { default: false })
  verified_purchase: boolean;

  @Column('integer', { default: 0 })
  helpful_count: number; // Number of people who found this review helpful

  @Column('simple-array', { default: '' })
  helpful_by: string[]; // Array of user IDs who found this helpful

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
