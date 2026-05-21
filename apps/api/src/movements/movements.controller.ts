import { Controller, Get, Param, UseGuards, ParseIntPipe, Query, DefaultValuePipe } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { MovementType, MovementOrigin, UserType } from 'shared';
import { MovementsService } from './movements.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Movements')
@ApiBearerAuth('JWT')
@Controller('movements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.ADMIN)
export class MovementsController {
  constructor(private movementsService: MovementsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar movimentações',
    description: 'Retorna o histórico completo de entradas e saídas de estoque com paginação, ordenação e filtros opcionais. Acesso: admin.',
  })
  @ApiQuery({ name: 'pageIndex', type: Number, required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', type: Number, required: false, example: 25 })
  @ApiQuery({ name: 'sortBy', type: String, required: false, example: 'movementDate' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, example: 'DESC' })
  @ApiQuery({ name: 'itemId',       type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'variationId',  type: Number, required: false, example: 3 })
  @ApiQuery({ name: 'movementType', enum: MovementType,   required: false })
  @ApiQuery({ name: 'originType',   enum: MovementOrigin, required: false })
  @ApiQuery({ name: 'originId',     type: Number, required: false, example: 5 })
  @ApiQuery({ name: 'itemName',     type: String, required: false })
  @ApiQuery({ name: 'dateFrom',     type: String, required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'dateTo',       type: String, required: false, example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Histórico de movimentações retornado.' })
  findAll(
    @Query('pageIndex', new DefaultValuePipe(0), ParseIntPipe) pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(25), ParseIntPipe)  pageSize: number,
    @Query('sortBy',    new DefaultValuePipe('movementDate'))   sortBy: string,
    @Query('sortOrder', new DefaultValuePipe('DESC'))           sortOrder: string,
    @Query('itemId')       itemId?: string,
    @Query('variationId')  variationId?: string,
    @Query('movementType') movementType?: string,
    @Query('originType')   originType?: string,
    @Query('originId')     originId?: string,
    @Query('itemName')     itemName?: string,
    @Query('dateFrom')     dateFrom?: string,
    @Query('dateTo')       dateTo?: string,
  ) {
    return this.movementsService.findAll({
      pageIndex, pageSize, sortBy, sortOrder,
      itemId:       itemId      ? Number(itemId)      : undefined,
      variationId:  variationId ? Number(variationId) : undefined,
      movementType: movementType as MovementType,
      originType:   originType  as MovementOrigin,
      originId:     originId    ? Number(originId)    : undefined,
      itemName,
      dateFrom,
      dateTo,
    });
  }

  @Get('item/:itemId')
  @ApiOperation({
    summary: 'Movimentações por item',
    description: 'Retorna o histórico de movimentações filtrado por item, com paginação e ordenação. Acesso: admin.',
  })
  @ApiQuery({ name: 'pageIndex', type: Number, required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', type: Number, required: false, example: 25 })
  @ApiQuery({ name: 'sortBy', type: String, required: false, example: 'movementDate' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, example: 'DESC' })
  @ApiQuery({ name: 'variationId', type: Number, required: false, example: 3 })
  @ApiQuery({ name: 'movementType', enum: MovementType, required: false })
  @ApiQuery({ name: 'originType', enum: MovementOrigin, required: false })
  @ApiParam({ name: 'itemId', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Movimentações do item retornadas.' })
  findByItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Query('pageIndex', new DefaultValuePipe(0), ParseIntPipe) pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(25), ParseIntPipe) pageSize: number,
    @Query('sortBy', new DefaultValuePipe('movementDate')) sortBy: string,
    @Query('sortOrder', new DefaultValuePipe('DESC')) sortOrder: string,
    @Query('variationId') variationId?: string,
    @Query('movementType') movementType?: string,
    @Query('originType') originType?: string,
  ) {
    return this.movementsService.findByItem(itemId, {
      pageIndex,
      pageSize,
      sortBy,
      sortOrder,
      variationId: variationId ? Number(variationId) : undefined,
      movementType: movementType as MovementType,
      originType: originType as MovementOrigin,
    });
  }
}
