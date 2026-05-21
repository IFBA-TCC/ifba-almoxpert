import { IsArray, IsInt, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShipmentLineDto {
  @ApiProperty({ example: 1, description: 'ID do item' })
  @IsInt()
  itemId: number;

  @ApiPropertyOptional({ example: 3, description: 'ID da variação do item (omitir para itens sem variação)' })
  @IsOptional()
  @IsInt()
  variationId?: number;

  @ApiProperty({ example: 50, description: 'Quantidade recebida', minimum: 1 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ example: 'M', description: 'Tamanho do item (none, PP, P, M, G, GG, GGG, 33-45). Padrão: none.' })
  @IsOptional()
  @IsString()
  size?: string;
}

export class CreateShipmentDto {
  @ApiPropertyOptional({ example: 'Recebimento referente ao pedido #42', description: 'Observações sobre o recebimento' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [ShipmentLineDto], description: 'Itens recebidos nesta entrada' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentLineDto)
  items: ShipmentLineDto[];
}
