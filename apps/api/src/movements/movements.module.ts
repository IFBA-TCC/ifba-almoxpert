import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementsController } from './movements.controller';
import { MovementsService } from './movements.service';
import { StockMovement } from './entities/stock-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement])],
  controllers: [MovementsController],
  providers:   [MovementsService],
  exports:     [MovementsService],
})
export class MovementsModule {}
