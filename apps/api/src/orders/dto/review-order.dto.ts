import {
  IsArray, IsEnum, IsInt, IsOptional, IsPositive,
  IsString, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from 'shared';

export class ReviewItemDto {
  @ApiProperty({ example: 1, description: 'ID do item do pedido (order_items.id)' })
  @IsInt()
  orderItemId: number;

  @ApiProperty({ example: 1, description: 'Quantidade aprovada (pode ser menor que a solicitada)', minimum: 1 })
  @IsInt()
  @IsPositive()
  approvedQuantity: number;
}

export class ReviewOrderDto {
  @ApiProperty({
    enum: [OrderStatus.APPROVED, OrderStatus.REJECTED],
    example: OrderStatus.APPROVED,
    description: 'Decisão do administrador',
  })
  @IsEnum([OrderStatus.APPROVED, OrderStatus.REJECTED])
  status: OrderStatus.APPROVED | OrderStatus.REJECTED;

  @ApiPropertyOptional({ example: 'Aprovado com quantidade reduzida por limitação de estoque.', description: 'Observação do administrador' })
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiPropertyOptional({
    type: [ReviewItemDto],
    description: 'Quantidades aprovadas por item. Obrigatório quando status = approved.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewItemDto)
  items?: ReviewItemDto[];
}
