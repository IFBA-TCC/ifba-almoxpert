import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  UseGuards, ParseIntPipe, Query, DefaultValuePipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserType, JwtPayload, ShipmentStatus } from 'shared';

@ApiTags('Shipments')
@ApiBearerAuth('JWT')
@Controller('shipments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.ADMIN)
export class ShipmentsController {
  constructor(private shipmentsService: ShipmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar entradas de estoque', description: 'Retorna todas as entradas de materiais no almoxarifado com paginação, ordenação e filtros opcionais. Acesso: admin.' })
  @ApiQuery({ name: 'pageIndex', type: Number, required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', type: Number, required: false, example: 25 })
  @ApiQuery({ name: 'sortBy', type: String, required: false, example: 'shipmentDate' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, example: 'DESC' })
  @ApiQuery({ name: 'status', enum: ShipmentStatus, required: false })
  @ApiQuery({ name: 'responsibleId', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'dateFrom', type: String, required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'dateTo',   type: String, required: false, example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Lista de entradas retornada.' })
  findAll(
    @Query('pageIndex', new DefaultValuePipe(0), ParseIntPipe) pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(25), ParseIntPipe) pageSize: number,
    @Query('sortBy', new DefaultValuePipe('shipmentDate')) sortBy: string,
    @Query('sortOrder', new DefaultValuePipe('DESC')) sortOrder: string,
    @Query('status')        status?: string,
    @Query('responsibleId') responsibleId?: string,
    @Query('dateFrom')      dateFrom?: string,
    @Query('dateTo')        dateTo?: string,
  ) {
    return this.shipmentsService.findAll({
      pageIndex,
      pageSize,
      sortBy,
      sortOrder,
      status:        status as any,
      responsibleId: responsibleId ? Number(responsibleId) : undefined,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar entrada por ID', description: 'Retorna uma entrada de estoque com seus itens. Acesso: admin.' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Entrada encontrada.' })
  @ApiResponse({ status: 404, description: 'Entrada não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Registrar entrada de estoque',
    description: 'Registra o recebimento de materiais, incrementando o estoque automaticamente e criando um registro de movimentação. Acesso: admin.',
  })
  @ApiResponse({ status: 201, description: 'Entrada registrada e estoque atualizado.' })
  create(
    @Body() dto: CreateShipmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.shipmentsService.create(dto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar remessa aberta', description: 'Substitui os itens de uma remessa em aberto, revertendo e reaplicando o estoque. Acesso: admin.' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Remessa atualizada.' })
  @ApiResponse({ status: 400, description: 'Remessa não está aberta.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateShipmentDto,
  ) {
    return this.shipmentsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir remessa aberta', description: 'Remove permanentemente uma remessa em aberto, revertendo o estoque. Acesso: admin.' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Remessa excluída.' })
  @ApiResponse({ status: 400, description: 'Remessa não está aberta.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.remove(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Concluir entrada', description: 'Marca uma entrada como concluída. Acesso: admin.' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Entrada concluída.' })
  @ApiResponse({ status: 400, description: 'Entrada não está aberta.' })
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.complete(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar entrada', description: 'Cancela uma entrada de estoque em aberto. Acesso: admin.' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Entrada cancelada.' })
  @ApiResponse({ status: 400, description: 'Entrada não está aberta.' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.cancel(id);
  }
}
