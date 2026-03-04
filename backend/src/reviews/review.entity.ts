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
  userId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @Column('uuid')
  productId: string;

  @ManyToOne(() => Order, { onDelete: 'SET NULL', nullable: true })
  order: Order | null;

  @Column('uuid', { nullable: true })
  orderId: string;

  @Column('boolean', { default: false })
  verifiedPurchase: boolean;

  @Column('integer', { default: 0 })
  helpfulCount: number; // Number of people who found this review helpful

  @Column('simple-array', { default: '' })
  helpfulBy: string[]; // Array of user IDs who found this helpful

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
