import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, EntityManager } from 'typeorm';
import { Stock } from './entities/stock.entity';

interface StockListQuery {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  itemId?: number;
  variationId?: number;
  itemName?: string;
}

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepo: Repository<Stock>,
  ) {}

  async findAll(query: StockListQuery = {}) {
    const pageIndex = query.pageIndex ?? 0;
    const pageSize = query.pageSize ?? 25;
    const sortOrder = query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const sortColumns: Record<string, string> = {
      itemId: 'stock.itemId',
      variationId: 'stock.variationId',
      availableQuantity: 'stock.availableQuantity',
      minimumQuantity: 'stock.minimumQuantity',
    };

    const qb = this.stockRepo.createQueryBuilder('stock')
      .leftJoinAndSelect('stock.item', 'item')
      .leftJoinAndSelect('stock.variation', 'variation');

    if (query.itemId !== undefined) {
      qb.where('stock.itemId = :itemId', { itemId: query.itemId });
    }

    if (query.variationId !== undefined) {
      qb.andWhere('stock.variationId = :variationId', {
        variationId: query.variationId,
      });
    }

    if (query.itemName) {
      qb.andWhere('item.name LIKE :itemName', { itemName: `%${query.itemName}%` });
    }

    qb.orderBy(sortColumns[query.sortBy] ?? 'stock.itemId', sortOrder)
      .skip(pageIndex * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, pageIndex, pageSize };
  }

  /** Returns stock entries where available_quantity <= minimum_quantity */
  async findLowStock(query: StockListQuery = {}) {
    const pageIndex = query.pageIndex ?? 0;
    const pageSize = query.pageSize ?? 25;
    const sortOrder = query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const sortColumns: Record<string, string> = {
      itemId: 's.itemId',
      variationId: 's.variationId',
      availableQuantity: 's.availableQuantity',
      minimumQuantity: 's.minimumQuantity',
    };

    const qb = this.stockRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.item', 'item')
      .leftJoinAndSelect('s.variation', 'variation')
      .where('s.availableQuantity <= s.minimumQuantity');

    if (query.itemName) {
      qb.andWhere('item.name LIKE :itemName', { itemName: `%${query.itemName}%` });
    }

    qb.orderBy(sortColumns[query.sortBy] ?? 's.itemId', sortOrder)
      .skip(pageIndex * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, pageIndex, pageSize };
  }

  /**
   * Find stock entry by (itemId, variationId|null, size).
   *
   * When a transactional `manager` is supplied, the lookup runs inside that
   * transaction. With `lock: true` it acquires a pessimistic write lock
   * (SELECT ... FOR UPDATE) on the row, serializing concurrent mutations and
   * preventing lost updates / overselling. The locked read omits relations on
   * purpose so the FOR UPDATE clause does not lock the joined item/variation
   * rows (a pessimistic lock is only valid inside a transaction).
   */
  private async findEntry(
    itemId: number,
    variationId: number | null | undefined,
    size: string = 'none',
    opts: { manager?: EntityManager; lock?: boolean } = {},
  ): Promise<Stock | null> {
    const vid = variationId ?? null;
    const repo = opts.manager ? opts.manager.getRepository(Stock) : this.stockRepo;
    return repo.findOne({
      where: { itemId, variationId: vid as any, size },
      relations: opts.lock ? [] : ['item', 'variation'],
      lock: opts.lock ? { mode: 'pessimistic_write' } : undefined,
    });
  }

  async findByItemVariationSize(
    itemId: number,
    variationId: number | null | undefined,
    size: string = 'none',
  ) {
    const entry = await this.findEntry(itemId, variationId, size);
    if (!entry) throw new NotFoundException('Stock entry not found');
    return entry;
  }

  /**
   * Increases stock (used by ShipmentsService on shipment completion).
   *
   * Pass the transactional `manager` so the read+write participates in the
   * caller's transaction and acquires a row lock. When the entry does not yet
   * exist it is created; concurrent creation of the same (item, variation,
   * size) is prevented by the unique constraint on the stock table.
   */
  async increaseQuantity(
    itemId: number,
    variationId: number | null | undefined,
    size: string = 'none',
    quantity: number,
    manager?: EntityManager,
  ) {
    const vid = variationId ?? null;
    const repo = manager ? manager.getRepository(Stock) : this.stockRepo;
    let entry = await this.findEntry(itemId, vid, size, { manager, lock: !!manager });

    if (!entry) {
      entry = repo.create({ itemId, variationId: vid, size, availableQuantity: 0 });
    }

    entry.availableQuantity += quantity;
    return repo.save(entry);
  }

  /**
   * Decreases stock (used by OrdersService on order delivery).
   *
   * Pass the transactional `manager` so the sufficiency check and the write
   * happen atomically under a pessimistic row lock - two concurrent deliveries
   * of the same item cannot both read the same balance and oversell.
   */
  async decreaseQuantity(
    itemId: number,
    variationId: number | null | undefined,
    size: string = 'none',
    quantity: number,
    manager?: EntityManager,
  ) {
    const vid = variationId ?? null;
    const repo = manager ? manager.getRepository(Stock) : this.stockRepo;
    const entry = await this.findEntry(itemId, vid, size, { manager, lock: !!manager });

    if (!entry) throw new NotFoundException('Stock entry not found');
    if (entry.availableQuantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock: available ${entry.availableQuantity}, requested ${quantity}`,
      );
    }

    entry.availableQuantity -= quantity;
    return repo.save(entry);
  }

  async updateMinimum(
    itemId: number,
    variationId: number | null | undefined,
    size: string = 'none',
    minimum: number,
  ) {
    const entry = await this.findByItemVariationSize(itemId, variationId, size);
    entry.minimumQuantity = minimum;
    return this.stockRepo.save(entry);
  }
}
