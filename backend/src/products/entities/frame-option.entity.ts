import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../product.entity';

@Entity('frame_options')
export class FrameOption {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => Product, (product) => product.frames, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column({ type: 'varchar', length: 100 })
    label: string;

    @Column({ name: 'color_hex', type: 'varchar', length: 7, nullable: true })
    colorHex: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    material: string;

    @Column({ name: 'price_delta', type: 'numeric', precision: 10, scale: 2, default: 0 })
    priceDelta: number;

    @Column({ type: 'boolean', default: true })
    active: boolean;
}
