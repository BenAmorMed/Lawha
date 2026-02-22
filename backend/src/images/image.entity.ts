import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/entities/user.entity';

@Entity('uploaded_images')
export class UploadedImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  original_filename: string;

  @Column({ type: 'varchar', length: 255 })
  stored_filename: string;

  @Column({ type: 'varchar', length: 255 })
  mime_type: string;

  @Column({ type: 'int' })
  file_size: number;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'int' })
  dpi: number;

  @Column({ type: 'varchar', length: 255 })
  s3_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  s3_thumbnail_url: string;

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON stringified

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
