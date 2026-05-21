import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { StockModule } from './stock/stock.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { OrdersModule } from './orders/orders.module';
import { MovementsModule } from './movements/movements.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host:     config.get<string>('DB_HOST',     'localhost'),
        port:     config.get<number>('DB_PORT',     3306),
        username: config.get<string>('DB_USER',     'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME',     'almoxpert'),
        autoLoadEntities: true,
        synchronize: false,
        charset: 'utf8mb4',
      }),
    }),
    AuthModule,
    UsersModule,
    ItemsModule,
    StockModule,
    ShipmentsModule,
    OrdersModule,
    MovementsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
