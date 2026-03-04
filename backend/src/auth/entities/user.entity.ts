import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column('text')
  passwordHash: string;

  @Column('varchar', { length: 255, nullable: true })
  fullName: string;

  @Column('varchar', { length: 20, default: 'customer' })
  role: 'customer' | 'admin';

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
