import {
  Controller, Get, Patch, Param, Body,
  UseGuards, ParseIntPipe, Query, DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiBody, ApiQuery,
} from '@nestjs/swagger';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from 'shared';

@ApiTags('Stock')
@ApiBearerAuth('JWT')
@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
  constructor(private stockService: StockService) {}

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Listar estoque completo' })
  @ApiQuery({ name: 'pageIndex', type: Number, required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', type: Number, required: false, example: 25 })
  @ApiQuery({ name: 'sortBy', type: String, required: false, example: 'itemId' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, example: 'ASC' })
  @ApiQuery({ name: 'itemId',     type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'variationId',type: Number, required: false, example: 3 })
  @ApiQuery({ name: 'itemName',   type: String, required: false })
  @ApiResponse({ status: 200, description: 'Estoque retornado com sucesso.' })
  findAll(
    @Query('pageIndex', new DefaultValuePipe(0), ParseIntPipe) pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(25), ParseIntPipe) pageSize: number,
    @Query('sortBy', new DefaultValuePipe('itemId')) sortBy: string,
    @Query('sortOrder', new DefaultValuePipe('ASC')) sortOrder: string,
    @Query('itemId')      itemId?: string,
    @Query('variationId') variationId?: string,
    @Query('itemName')    itemName?: string,
  ) {
    return this.stockService.findAll({
      pageIndex,
      pageSize,
      sortBy,
      sortOrder,
      itemId:      itemId      ? Number(itemId)      : undefined,
      variationId: variationId ? Number(variationId) : undefined,
      itemName,
    });
  }

  @Get('low')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Itens com estoque baixo' })
  @ApiQuery({ name: 'pageIndex', type: Number, required: false, example: 0 })
  @ApiQuery({ name: 'pageSize',  type: Number, required: false, example: 25 })
  @ApiQuery({ name: 'sortBy',    type: String, required: false, example: 'itemId' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, example: 'ASC' })
  @ApiQuery({ name: 'itemName',  type: String, required: false })
  @ApiResponse({ status: 200, description: 'Lista de itens com estoque baixo.' })
  findLowStock(
    @Query('pageIndex', new DefaultValuePipe(0), ParseIntPipe) pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(25), ParseIntPipe) pageSize: number,
    @Query('sortBy', new DefaultValuePipe('itemId')) sortBy: string,
    @Query('sortOrder', new DefaultValuePipe('ASC')) sortOrder: string,
    @Query('itemName') itemName?: string,
  ) {
    return this.stockService.findLowStock({ pageIndex, pageSize, sortBy, sortOrder, itemName });
  }

  @Get(':itemId/:variationId/:size')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Consultar estoque de um item/variação/tamanho' })
  @ApiParam({ name: 'itemId', type: Number, example: 1 })
  @ApiParam({ name: 'variationId', type: Number, example: 3 })
  @ApiParam({ name: 'size', type: String, example: 'none' })
  @ApiResponse({ status: 200, description: 'Entrada de estoque encontrada.' })
  @ApiResponse({ status: 404, description: 'Entrada não encontrada.' })
  findOne(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('variationId', ParseIntPipe) variationId: number,
    @Param('size') size: string,
  ) {
    return this.stockService.findByItemVariationSize(itemId, variationId, size);
  }

  @Patch(':itemId/:variationId/:size/minimum')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Atualizar quantidade mínima para item/variação/tamanho' })
  @ApiParam({ name: 'itemId', type: Number, example: 1 })
  @ApiParam({ name: 'variationId', type: Number, example: 3 })
  @ApiParam({ name: 'size', type: String, example: 'none' })
  @ApiBody({ schema: { example: { minimum: 20 } } })
  @ApiResponse({ status: 200, description: 'Mínimo atualizado com sucesso.' })
  updateMinimum(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('variationId', ParseIntPipe) variationId: number,
    @Param('size') size: string,
    @Body('minimum', ParseIntPipe) minimum: number,
  ) {
    return this.stockService.updateMinimum(itemId, variationId, size, minimum);
  }
}
