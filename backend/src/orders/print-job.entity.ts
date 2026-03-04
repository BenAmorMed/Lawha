import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';

export type PrintJobStatus = 'queued' | 'processing' | 'printed' | 'failed';

@Entity('print_jobs')
export class PrintJob {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    order_item_id: string;

    @Column({ type: 'varchar', length: 50, default: 'queued' })
    status: PrintJobStatus;

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ type: 'text', nullable: true })
    error_message: string;

    @Column({ type: 'timestamp', nullable: true })
    started_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    completed_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => OrderItem)
    @JoinColumn({ name: 'order_item_id' })
    orderItem: OrderItem;
}
