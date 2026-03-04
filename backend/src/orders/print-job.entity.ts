import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';

export type PrintJobStatus = 'queued' | 'processing' | 'printed' | 'failed';

@Entity('print_jobs')
export class PrintJob {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_item_id', type: 'uuid' })
    orderItemId: string;

    @Column({ type: 'varchar', length: 50, default: 'queued' })
    status: PrintJobStatus;

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage: string;

    @Column({ name: 'started_at', type: 'timestamp', nullable: true })
    startedAt: Date;

    @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
    completedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => OrderItem)
    @JoinColumn({ name: 'order_item_id' })
    orderItem: OrderItem;
}
