import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PROCESSING = 'processing',
  PRINTING = 'printing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ name: 'guest_email', type: 'varchar', length: 255, nullable: true })
  guestEmail: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
  shippingAddr: any;

  @Column({ name: 'tracking_number', type: 'varchar', length: 255, nullable: true })
  trackingNumber: string;

  @Column({ name: 'print_pdf_url', type: 'text', nullable: true })
  printPdfUrl: string;

  @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}
