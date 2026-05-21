import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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

  /** Find stock entry by (itemId, variationId|null, size) */
  private async findEntry(
    itemId: number,
    variationId: number | null | undefined,
    size: string = 'none',
  ): Promise<Stock | null> {
    const vid = variationId ?? null;
    return this.stockRepo.findOne({
      where: { itemId, variationId: vid as any, size },
      relations: ['item', 'variation'],
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

  /** Increases stock (used by ShipmentsService) */
  async increaseQuantity(
    itemId: number,
    variationId: number | null | undefined,
    size: string = 'none',
    quantity: number,
  ) {
    const vid = variationId ?? null;
    let entry = await this.findEntry(itemId, vid, size);

    if (!entry) {
      entry = this.stockRepo.create({ itemId, variationId: vid, size, availableQuantity: 0 });
    }

    entry.availableQuantity += quantity;
    return this.stockRepo.save(entry);
  }

  /** Decreases stock (used by OrdersService) */
  async decreaseQuantity(
    itemId: number,
    variationId: number | null | undefined,
    size: string = 'none',
    quantity: number,
  ) {
    const vid = variationId ?? null;
    const entry = await this.findEntry(itemId, vid, size);

    if (!entry) throw new NotFoundException('Stock entry not found');
    if (entry.availableQuantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock: available ${entry.availableQuantity}, requested ${quantity}`,
      );
    }

    entry.availableQuantity -= quantity;
    return this.stockRepo.save(entry);
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
