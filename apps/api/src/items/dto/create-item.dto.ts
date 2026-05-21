import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SizeType } from 'shared';

export class CreateItemDto {
  @ApiProperty({ example: 'Caderno', description: 'Nome do item' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Material Escolar', description: 'Tipo/categoria do item' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 'unit', description: 'Unidade de medida (unit, box, ream...)' })
  @IsString()
  unitOfMeasure: string;

  @ApiPropertyOptional({ example: true, description: 'Se o item possui variações (ex: cor)' })
  @IsOptional()
  @IsBoolean()
  hasVariations?: boolean;

  @ApiPropertyOptional({
    enum: SizeType,
    default: SizeType.NONE,
    description: 'Define se o item tem tamanho: none = sem tamanho, clothing = PP/P/M/G/GG/GGG, shoes = 33-45',
  })
  @IsOptional()
  @IsEnum(SizeType)
  sizeType?: SizeType;

  @ApiPropertyOptional({
    example: ['100 folhas', '200 folhas'],
    description: 'Lista de variações a criar junto com o item',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variations?: string[];
}
