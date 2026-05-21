import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { ShipmentStatus } from 'shared';
import { User } from '../../users/entities/user.entity';
import { ShipmentItem } from './shipment-item.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'shipment_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  shipmentDate: Date;

  @Column({ name: 'responsible_id', type: 'bigint' })
  responsibleId: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.OPEN,
  })
  status: ShipmentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsible_id' })
  responsible: User;

  @OneToMany(() => ShipmentItem, (si) => si.shipment, { cascade: true })
  items: ShipmentItem[];
}
