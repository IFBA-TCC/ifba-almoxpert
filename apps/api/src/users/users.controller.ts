import {
  Controller, Get, Post, Patch, Param, Body,
  UseGuards, ParseIntPipe, Query, DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from 'shared';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Listar usuários', description: 'Retorna todos os usuários cadastrados com paginação, ordenação e filtros opcionais. Acesso: admin.' })
  @ApiQuery({ name: 'pageIndex', type: Number, required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', type: Number, required: false, example: 25 })
  @ApiQuery({ name: 'sortBy', type: String, required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, example: 'ASC' })
  @ApiQuery({ name: 'userType', enum: UserType, required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false, example: true })
  @ApiQuery({ name: 'email', type: String, required: false, example: 'aluno@ifba.edu.br' })
  @ApiQuery({ name: 'name', type: String, required: false, example: 'Maria' })
  @ApiQuery({ name: 'createdFrom', type: String, required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'createdTo', type: String, required: false, example: '2026-12-31' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findAll(
    @Query('pageIndex', new DefaultValuePipe(0), ParseIntPipe) pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(25), ParseIntPipe) pageSize: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortOrder', new DefaultValuePipe('ASC')) sortOrder: string,
    @Query('userType') userType?: string,
    @Query('isActive') isActive?: string,
    @Query('email') email?: string,
    @Query('name') name?: string,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    return this.usersService.findAll({
      pageIndex,
      pageSize,
      sortBy,
      sortOrder,
      userType: userType as any,
      isActive: isActive === undefined ? undefined : isActive === 'true',
      email,
      name,
      createdFrom,
      createdTo,
    });
  }

  @Get(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Buscar usuário por ID', description: 'Retorna um usuário pelo ID. Acesso: admin.' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Criar usuário', description: 'Cria um estudante ou administrador. Acesso: admin.' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Atualizar usuário', description: 'Atualiza dados de um usuário. Acesso: admin.' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Desativar usuário', description: 'Desativa a conta de um usuário. Acesso: admin.' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Usuário desativado com sucesso.' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deactivate(id);
  }
}
