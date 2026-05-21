// shipments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { Shipment } from './entities/shipment.entity';
import { ShipmentItem } from './entities/shipment-item.entity';
import { StockModule } from '../stock/stock.module';
import { MovementsModule } from '../movements/movements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, ShipmentItem]),
    StockModule,
    MovementsModule,
  ],
  controllers: [ShipmentsController],
  providers:   [ShipmentsService],
})
export class ShipmentsModule {}
