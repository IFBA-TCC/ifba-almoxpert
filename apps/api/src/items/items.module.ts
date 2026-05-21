import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { ItemVariation } from './entities/item-variation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, ItemVariation])],
  controllers: [ItemsController],
  providers:   [ItemsService],
  exports:     [ItemsService],
})
export class ItemsModule {}
