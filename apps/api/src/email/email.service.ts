import * as path from 'path';
import * as fs   from 'fs';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  passwordResetTemplate,
  passwordResetAdminTemplate,
  welcomeTemplate,
  orderReviewTemplate,
} from './templates';
import type { OrderReviewStatus, OrderReviewItem } from './templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private smtpConfigured: boolean;
  private readonly logoAttachment: { filename: string; path: string; cid: string } | null;

  constructor(private config: ConfigService) {
    const user = config.get<string>('SMTP_USER', '');
    const pass = config.get<string>('SMTP_PASS', '');
    const secure = this.parseBoolean(config.get<string>('SMTP_SECURE', 'false'));
    this.smtpConfigured = !!(user && pass);
    this.logoAttachment = this.resolveLogoAttachment();

    if (this.smtpConfigured) {
      this.transporter = nodemailer.createTransport({
        host:   config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
        port:   config.get<number>('SMTP_PORT', 587),
        secure,
        auth:   { user, pass },
      });
    } else {
      this.logger.warn('SMTP não configurado. E-mails serão exibidos no console.');
    }
  }

  private get from(): string {
    return this.config.get<string>('SMTP_FROM')
      || `"AlmoxPert IFBA" <${this.config.get('SMTP_USER')}>`;
  }

  private parseBoolean(value: string): boolean {
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
  }

  private resolveLogoAttachment(): { filename: string; path: string; cid: string } | null {
    const configuredLogoPath = this.config.get<string>('EMAIL_LOGO_PATH');
    const candidatePaths = [
      configuredLogoPath,
      path.resolve(process.cwd(), 'apps/api/public/iconeAlmoXpert.png'),
      path.resolve(process.cwd(), 'apps/web/public/iconeAlmoXpert.png'),
      path.resolve(__dirname, '../public/iconeAlmoXpert.png'),
      path.resolve(__dirname, '../../../../apps/web/public/iconeAlmoXpert.png'),
    ].filter((candidate): candidate is string => !!candidate);

    for (const candidatePath of candidatePaths) {
      if (fs.existsSync(candidatePath)) {
        return { filename: 'logo.png', path: candidatePath, cid: 'almoxpert-logo' };
      }
    }

    this.logger.warn(`Logo do e-mail não encontrada. Caminhos verificados: ${candidatePaths.join(', ')}`);
    return null;
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}***@${domain ?? '?'}`;
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.smtpConfigured || !this.transporter) return;
    try {
      await this.transporter.sendMail({
        from:        this.from,
        to,
        subject,
        html,
        attachments: this.logoAttachment ? [this.logoAttachment] : [],
      });
    } catch (err) {
      this.logger.error(`Falha ao enviar e-mail (${this.maskEmail(to)}): ${subject}`, err);
    }
  }

  async sendWelcome(to: string, name: string, password: string): Promise<void> {
    if (!this.smtpConfigured) {
      this.logger.log(`[DEV] E-mail de boas-vindas enviado para ${name} <${this.maskEmail(to)}>`);
      return;
    }
    await this.send(to, 'Bem-vindo ao AlmoxPert – IFBA', welcomeTemplate(name, to, password, !!this.logoAttachment));
  }

  async sendPasswordResetCode(to: string, name: string, code: string): Promise<void> {
    if (!this.smtpConfigured) {
      this.logger.log(`[DEV] E-mail de redefinição de senha enviado para ${name} <${this.maskEmail(to)}>`);
      return;
    }
    await this.send(to, 'Código de Redefinição de Senha – AlmoxPert', passwordResetTemplate(name, code, !!this.logoAttachment));
  }

  async sendPasswordResetByAdmin(to: string, name: string, defaultPassword: string): Promise<void> {
    if (!this.smtpConfigured) {
      this.logger.log(`[DEV] E-mail de reset de senha (admin) enviado para ${name} <${this.maskEmail(to)}>`);
      return;
    }
    await this.send(
      to,
      'Sua Senha foi Redefinida – AlmoxPert',
      passwordResetAdminTemplate(name, defaultPassword, !!this.logoAttachment),
    );
  }

  async sendOrderReview(
    to: string,
    name: string,
    orderId: number,
    status: OrderReviewStatus,
    items: OrderReviewItem[],
    adminNotes?: string | null,
  ): Promise<void> {
    if (!this.smtpConfigured) {
      this.logger.log(`[DEV] E-mail de revisão do pedido #${orderId} enviado para ${name} <${this.maskEmail(to)}> — status: ${status}`);
      return;
    }
    await this.send(
      to,
      `Atualização do seu pedido #${orderId} – AlmoxPert`,
      orderReviewTemplate(name, orderId, status, items, adminNotes, !!this.logoAttachment),
    );
  }

  async sendOrderDelivered(
    to: string,
    name: string,
    orderId: number,
    items: OrderReviewItem[],
  ): Promise<void> {
    if (!this.smtpConfigured) {
      this.logger.log(`[DEV] E-mail de entrega do pedido #${orderId} enviado para ${name} <${this.maskEmail(to)}>`);
      return;
    }
    await this.send(
      to,
      `Pedido #${orderId} entregue – AlmoxPert`,
      orderReviewTemplate(name, orderId, 'delivered', items, undefined, !!this.logoAttachment),
    );
  }
}
