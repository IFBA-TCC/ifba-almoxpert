import {
  IsArray, IsEnum, IsInt, IsOptional, IsPositive,
  IsString, Min, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from 'shared';

export class ReviewItemDto {
  @ApiProperty({ example: 1, description: 'ID do item do pedido (order_items.id)' })
  @IsInt()
  orderItemId: number;

  @ApiProperty({ example: 1, description: 'Quantidade aprovada. Use 0 para reprovar o item individualmente.', minimum: 0 })
  @IsInt()
  @Min(0)
  approvedQuantity: number;
}

export class NewOrderItemDto {
  @ApiProperty({ example: 1, description: 'ID do item do catálogo' })
  @IsInt()
  itemId: number;

  @ApiPropertyOptional({ example: 3, description: 'ID da variação (opcional)' })
  @IsOptional()
  @IsInt()
  variationId?: number;

  @ApiPropertyOptional({ example: 'M', description: 'Tamanho (none se não aplicável)' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ example: 2, description: 'Quantidade aprovada pelo administrador', minimum: 1 })
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

  @ApiPropertyOptional({ example: 'Aprovado com quantidade reduzida por limitação de estoque.' })
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

  @ApiPropertyOptional({
    type: [NewOrderItemDto],
    description: 'Novos itens adicionados pelo administrador ao pedido durante a revisão.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewOrderItemDto)
  newItems?: NewOrderItemDto[];
}
