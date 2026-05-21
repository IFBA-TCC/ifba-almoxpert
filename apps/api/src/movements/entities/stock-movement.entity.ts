import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { MovementType, MovementOrigin } from 'shared';
import { Item } from '../../items/entities/item.entity';
import { ItemVariation } from '../../items/entities/item-variation.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'item_id', type: 'bigint' })
  itemId: number;

  @Column({ name: 'variation_id', type: 'bigint', nullable: true })
  variationId: number | null;

  @Column({ length: 20, default: 'none' })
  size: string;

  @Column({
    name: 'movement_type',
    type: 'enum',
    enum: MovementType,
  })
  movementType: MovementType;

  @Column()
  quantity: number;

  @Column({ name: 'movement_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  movementDate: Date;

  @Column({
    name: 'origin_type',
    type: 'enum',
    enum: MovementOrigin,
  })
  originType: MovementOrigin;

  @Column({ name: 'origin_id', type: 'bigint' })
  originId: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @ManyToOne(() => ItemVariation, { nullable: true })
  @JoinColumn({ name: 'variation_id' })
  variation: ItemVariation | null;
}
