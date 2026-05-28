import {
  Controller, Post, Patch, Get, Body, HttpCode, HttpStatus, UseGuards, Request, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar redefinição de senha via e-mail' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar código e redefinir senha para o padrão' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alterar senha (usuário autenticado)' })
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.sub, dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna o perfil completo do usuário autenticado' })
  getMe(@Request() req) {
    return this.authService.getMe(req.user.sub);
  }

  @Patch('preferences')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar preferências do usuário autenticado' })
  updatePreferences(@Request() req, @Body() dto: UpdatePreferencesDto) {
    return this.authService.updatePreferences(req.user.sub, dto.receiveEmails);
  }

  @Patch('accept-terms')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar aceite dos termos de uso e privacidade' })
  acceptTerms(@Request() req) {
    return this.authService.acceptTerms(req.user.sub);
  }

  @Get('me/export')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar todos os dados pessoais do titular (LGPD art. 18)' })
  async exportMyData(@Request() req, @Res() res: Response) {
    const data     = await this.authService.exportMyData(req.user.sub);
    const json     = JSON.stringify(data, null, 2);
    const filename = `meus-dados-almoxpert-${new Date().toISOString().slice(0, 10)}.json`;
    res.set({
      'Content-Type':        'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(json);
  }
}
