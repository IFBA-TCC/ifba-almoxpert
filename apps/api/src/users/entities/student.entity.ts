import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  OneToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unique: true })
  userId: number;

  @Column({ name: 'registration_number', length: 50, unique: true, nullable: true })
  registrationNumber: string;

  @Column({ length: 100, nullable: true })
  course: string;

  @Column({ name: 'social_programs', length: 255, nullable: true })
  socialPrograms: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (u) => u.studentProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
