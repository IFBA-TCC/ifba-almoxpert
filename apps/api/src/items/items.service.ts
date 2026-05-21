import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SizeType } from 'shared';
import { Item } from './entities/item.entity';
import { ItemVariation } from './entities/item-variation.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

interface ItemsListQuery {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  name?: string;
  type?: string;
  isActive?: boolean;
}

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepo: Repository<Item>,
    @InjectRepository(ItemVariation)
    private variationsRepo: Repository<ItemVariation>,
  ) {}

  async findAll(query: ItemsListQuery = {}) {
    const pageIndex = query.pageIndex ?? 0;
    const pageSize = query.pageSize ?? 25;
    const sortOrder = query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const sortColumns: Record<string, string> = {
      name: 'item.name',
      type: 'item.type',
      createdAt: 'item.createdAt',
    };

    const qb = this.itemsRepo.createQueryBuilder('item')
      .leftJoinAndSelect('item.variations', 'variation');

    if (query.isActive !== undefined) {
      qb.where('item.isActive = :isActive', { isActive: query.isActive });
    }

    if (query.name) {
      qb.andWhere('item.name LIKE :name', { name: `%${query.name}%` });
    }

    if (query.type) {
      qb.andWhere('item.type = :type', { type: query.type });
    }

    qb.orderBy(sortColumns[query.sortBy] ?? 'item.name', sortOrder)
      .skip(pageIndex * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, pageIndex, pageSize };
  }

  async findOne(id: number) {
    const item = await this.itemsRepo.findOne({
      where: { id },
      relations: ['variations'],
    });
    if (!item) throw new NotFoundException(`Item #${id} not found`);
    return item;
  }

  async create(dto: CreateItemDto) {
    const item = this.itemsRepo.create({
      name:          dto.name,
      type:          dto.type,
      unitOfMeasure: dto.unitOfMeasure,
      hasVariations: dto.hasVariations ?? false,
      sizeType:      dto.sizeType ?? SizeType.NONE,
    });
    const saved = await this.itemsRepo.save(item);

    if (dto.variations?.length) {
      await this.variationsRepo.save(
        dto.variations.map((v) =>
          this.variationsRepo.create({ itemId: saved.id, description: v }),
        ),
      );
    }

    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateItemDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.itemsRepo.save(item);
  }

  /** Ativa ou desativa um item (toggle) */
  async toggleItem(id: number) {
    const item = await this.findOne(id);
    item.isActive = !item.isActive;
    return this.itemsRepo.save(item);
  }

  /** Ativa ou desativa uma variação específica (toggle) */
  async toggleVariation(itemId: number, variationId: number) {
    await this.findOne(itemId); // garante que o item existe
    const variation = await this.variationsRepo.findOne({
      where: { id: variationId, itemId },
    });
    if (!variation) throw new NotFoundException(`Variation #${variationId} not found`);
    variation.isActive = !variation.isActive;
    return this.variationsRepo.save(variation);
  }

  async deactivate(id: number) {
    const item = await this.findOne(id);
    item.isActive = false;
    return this.itemsRepo.save(item);
  }

  async addVariation(itemId: number, description: string) {
    await this.findOne(itemId);
    return this.variationsRepo.save(
      this.variationsRepo.create({ itemId, description }),
    );
  }
}
