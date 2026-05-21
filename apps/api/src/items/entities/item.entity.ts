import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { SizeType } from 'shared';
import { ItemVariation } from './item-variation.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, nullable: true })
  type: string;

  @Column({ name: 'unit_of_measure', length: 50 })
  unitOfMeasure: string;

  @Column({ name: 'has_variations', default: false })
  hasVariations: boolean;

  @Column({
    name: 'size_type',
    type: 'enum',
    enum: SizeType,
    default: SizeType.NONE,
  })
  sizeType: SizeType;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ItemVariation, (v) => v.item, { cascade: true })
  variations: ItemVariation[];
}
