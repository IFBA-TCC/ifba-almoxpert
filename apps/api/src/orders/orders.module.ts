import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { StockModule } from '../stock/stock.module';
import { MovementsModule } from '../movements/movements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    StockModule,
    MovementsModule,
  ],
  controllers: [OrdersController],
  providers:   [OrdersService],
})
export class OrdersModule {}
