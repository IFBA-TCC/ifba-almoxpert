import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Item } from '../../items/entities/item.entity';
import { ItemVariation } from '../../items/entities/item-variation.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'order_id', type: 'bigint' })
  orderId: number;

  @Column({ name: 'item_id', type: 'bigint' })
  itemId: number;

  @Column({ name: 'variation_id', type: 'bigint', nullable: true })
  variationId: number | null;

  @Column({ length: 20, default: 'none' })
  size: string;

  @Column({ name: 'requested_quantity' })
  requestedQuantity: number;

  @Column({ name: 'approved_quantity', nullable: true })
  approvedQuantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Order, (o) => o.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @ManyToOne(() => ItemVariation, { nullable: true })
  @JoinColumn({ name: 'variation_id' })
  variation: ItemVariation | null;
}
