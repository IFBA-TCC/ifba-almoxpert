import {
  Controller, Get, Post, Patch, Param, Body,
  UseGuards, ParseIntPipe, Query, DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ReviewOrderDto } from './dto/review-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserType, JwtPayload, OrderStatus } from 'shared';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar pedidos',
    description: 'Admins veem todos os pedidos e podem filtrar por usuário ou status. Estudantes veem apenas os próprios pedidos. Paginação e ordenação disponíveis.',
  })
  @ApiQuery({ name: 'pageIndex', type: Number, required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', type: Number, required: false, example: 25 })
  @ApiQuery({ name: 'sortBy', type: String, required: false, example: 'orderDate' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, example: 'DESC' })
  @ApiQuery({ name: 'status',   enum: OrderStatus, required: false })
  @ApiQuery({ name: 'userId',   type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'userName', type: String, required: false })
  @ApiQuery({ name: 'dateFrom', type: String, required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'dateTo',   type: String, required: false, example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos retornada.' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('pageIndex', new DefaultValuePipe(0), ParseIntPipe) pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(25), ParseIntPipe) pageSize: number,
    @Query('sortBy', new DefaultValuePipe('orderDate')) sortBy: string,
    @Query('sortOrder', new DefaultValuePipe('DESC')) sortOrder: string,
    @Query('status')   status?: string,
    @Query('userId')   userId?: string,
    @Query('userName') userName?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo')   dateTo?: string,
  ) {
    return this.ordersService.findAll(user, {
      pageIndex,
      pageSize,
      sortBy,
      sortOrder,
      status:   status as any,
      userId:   userId ? Number(userId) : undefined,
      userName,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar pedido por ID',
    description: 'Admins acessam qualquer pedido. Estudantes acessam apenas os próprios.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Pedido encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado (estudante tentando ver pedido de outro).' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.findOne(id, user);
  }

  @Post()
  @Roles(UserType.STUDENT)
  @ApiOperation({
    summary: 'Criar pedido',
    description: 'Estudante solicita materiais do almoxarifado. O pedido fica com status "pending" até análise do admin. Acesso: estudante.',
  })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso.' })
  create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.create(dto, user.sub);
  }

  @Patch(':id/review')
  @Roles(UserType.ADMIN)
  @ApiOperation({
    summary: 'Aprovar ou rejeitar pedido',
    description: 'Admin aprova ou rejeita um pedido pendente. Na aprovação, pode ajustar as quantidades. Acesso: admin.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Pedido revisado.' })
  @ApiResponse({ status: 400, description: 'Pedido não está pendente.' })
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewOrderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.review(id, dto, user.sub);
  }

  @Patch(':id/deliver')
  @Roles(UserType.ADMIN)
  @ApiOperation({
    summary: 'Entregar pedido',
    description: 'Marca o pedido como entregue e deduz as quantidades aprovadas do estoque. Gera registro de movimentação. Acesso: admin.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Pedido marcado como entregue e estoque atualizado.' })
  @ApiResponse({ status: 400, description: 'Pedido não está aprovado.' })
  deliver(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.deliver(id);
  }
}
