import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';
import { Item } from '../../items/entities/item.entity';
import { ItemVariation } from '../../items/entities/item-variation.entity';

@Entity('shipment_items')
export class ShipmentItem {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'shipment_id', type: 'bigint' })
  shipmentId: number;

  @Column({ name: 'item_id', type: 'bigint' })
  itemId: number;

  @Column({ name: 'variation_id', type: 'bigint', nullable: true })
  variationId: number | null;

  @Column({ length: 20, default: 'none' })
  size: string;

  @Column()
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Shipment, (s) => s.items)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @ManyToOne(() => ItemVariation, { nullable: true })
  @JoinColumn({ name: 'variation_id' })
  variation: ItemVariation | null;
}
