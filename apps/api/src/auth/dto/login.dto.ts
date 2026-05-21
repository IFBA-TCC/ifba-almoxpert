import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@ifba.edu.br', description: 'E-mail do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'Senha (mínimo 6 caracteres)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
