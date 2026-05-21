import {
  Entity, PrimaryGeneratedColumn, Column,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Item } from '../../items/entities/item.entity';
import { ItemVariation } from '../../items/entities/item-variation.entity';

@Entity('stock')
export class Stock {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'item_id', type: 'bigint' })
  itemId: number;

  @Column({ name: 'variation_id', type: 'bigint', nullable: true })
  variationId: number | null;

  /** 'none' for items without size; clothing or shoes size value otherwise */
  @Column({ length: 20, default: 'none' })
  size: string;

  @Column({ name: 'available_quantity', default: 0 })
  availableQuantity: number;

  @Column({ name: 'minimum_quantity', default: 10 })
  minimumQuantity: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @ManyToOne(() => ItemVariation, { nullable: true })
  @JoinColumn({ name: 'variation_id' })
  variation: ItemVariation | null;
}
