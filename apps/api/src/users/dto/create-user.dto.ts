import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from 'shared';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'joao@ifba.edu.br', description: 'E-mail único' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha (mínimo 6 caracteres)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserType, example: UserType.STUDENT, description: 'Tipo de usuário' })
  @IsEnum(UserType)
  userType: UserType;

  // ── Student-only ──────────────────────────────────────────
  @ApiPropertyOptional({ example: '2024001', description: 'Matrícula (somente estudantes)' })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiPropertyOptional({ example: 'Sistemas de Informação', description: 'Curso (somente estudantes)' })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiPropertyOptional({ example: 'PNAES', description: 'Programas sociais vinculados (somente estudantes)' })
  @IsOptional()
  @IsString()
  socialPrograms?: string;

  // ── Admin-only ────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'Assistente Social', description: 'Cargo (somente administradores)' })
  @IsOptional()
  @IsString()
  position?: string;
}
