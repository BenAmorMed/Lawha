import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('templates')
export class Template {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true, name: 'template_key' })
    templateKey: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 100 })
    category: string;

    @Column({ type: 'jsonb' })
    definition: Record<string, any>;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'thumbnail_url' })
    thumbnailUrl: string;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
