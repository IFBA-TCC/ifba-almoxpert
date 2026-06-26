import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { MovementType, MovementOrigin } from 'shared';
import { StockMovement } from './entities/stock-movement.entity';

export interface RecordMovementParams {
  itemId:       number;
  variationId:  number | null;
  size:         string;
  movementType: MovementType;
  quantity:     number;
  originType:   MovementOrigin;
  originId:     number;
  notes?:       string;
}

interface MovementsListQuery {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  itemId?: number;
  variationId?: number;
  movementType?: MovementType;
  originType?: MovementOrigin;
  originId?: number;
  itemName?: string;
  dateFrom?: string;   // ISO date string  YYYY-MM-DD
  dateTo?: string;     // ISO date string  YYYY-MM-DD (inclusive)
}

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private movementsRepo: Repository<StockMovement>,
  ) {}

  /**
   * Creates a movement audit record. Called internally by Shipments and Orders.
   * Pass the transactional `manager` so the record is written inside the same
   * transaction as the stock mutation it documents (atomic audit trail).
   */
  record(params: RecordMovementParams, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(StockMovement) : this.movementsRepo;
    return repo.save(repo.create(params));
  }

  async findAll(query: MovementsListQuery = {}) {
    const pageIndex = query.pageIndex ?? 0;
    const pageSize = query.pageSize ?? 25;
    const sortOrder = query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const sortColumns: Record<string, string> = {
      movementDate: 'movement.movementDate',
      quantity: 'movement.quantity',
      originType: 'movement.originType',
    };

    const qb = this.movementsRepo.createQueryBuilder('movement')
      .leftJoinAndSelect('movement.item', 'item')
      .leftJoinAndSelect('movement.variation', 'variation');

    if (query.itemId !== undefined) {
      qb.where('movement.itemId = :itemId', { itemId: query.itemId });
    }

    if (query.variationId !== undefined) {
      qb.andWhere('movement.variationId = :variationId', { variationId: query.variationId });
    }

    if (query.movementType) {
      qb.andWhere('movement.movementType = :movementType', { movementType: query.movementType });
    }

    if (query.originType) {
      qb.andWhere('movement.originType = :originType', { originType: query.originType });
    }

    if (query.originId) {
      qb.andWhere('movement.originId = :originId', { originId: query.originId });
    }

    if (query.itemName) {
      qb.andWhere('item.name LIKE :itemName', { itemName: `%${query.itemName}%` });
    }

    if (query.dateFrom) {
      qb.andWhere('movement.movementDate >= :dateFrom', {
        dateFrom: new Date(query.dateFrom + 'T00:00:00'),
      });
    }

    if (query.dateTo) {
      qb.andWhere('movement.movementDate <= :dateTo', {
        dateTo: new Date(query.dateTo + 'T23:59:59'),
      });
    }

    qb.orderBy(sortColumns[query.sortBy] ?? 'movement.movementDate', sortOrder)
      .skip(pageIndex * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, pageIndex, pageSize };
  }

  async findByItem(itemId: number, query: MovementsListQuery = {}) {
    const pageIndex = query.pageIndex ?? 0;
    const pageSize = query.pageSize ?? 25;
    const sortOrder = query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const sortColumns: Record<string, string> = {
      movementDate: 'movement.movementDate',
      quantity: 'movement.quantity',
      originType: 'movement.originType',
    };

    const qb = this.movementsRepo.createQueryBuilder('movement')
      .leftJoinAndSelect('movement.item', 'item')
      .leftJoinAndSelect('movement.variation', 'variation')
      .where('movement.itemId = :itemId', { itemId });

    if (query.variationId !== undefined) {
      qb.andWhere('movement.variationId = :variationId', { variationId: query.variationId });
    }

    if (query.movementType) {
      qb.andWhere('movement.movementType = :movementType', { movementType: query.movementType });
    }

    if (query.originType) {
      qb.andWhere('movement.originType = :originType', { originType: query.originType });
    }

    qb.orderBy(sortColumns[query.sortBy] ?? 'movement.movementDate', sortOrder)
      .skip(pageIndex * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, pageIndex, pageSize };
  }
}
