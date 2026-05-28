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

// Resolve relative to this file — works in both src/ (dev) and dist/ (prod)
const LOGO_PATH = path.resolve(__dirname, '../../../../apps/web/public/logoAlmoXpert.png');

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private smtpConfigured: boolean;

  constructor(private config: ConfigService) {
    const user = config.get<string>('SMTP_USER', '');
    const pass = config.get<string>('SMTP_PASS', '');
    this.smtpConfigured = !!(user && pass);

    if (this.smtpConfigured) {
      this.transporter = nodemailer.createTransport({
        host:   config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
        port:   config.get<number>('SMTP_PORT', 587),
        secure: false,
        auth:   { user, pass },
      });
    } else {
      this.logger.warn('SMTP não configurado. E-mails serão exibidos no console.');
    }
  }

  private get from(): string {
    return `"AlmoxPert IFBA" <${this.config.get('SMTP_USER')}>`;
  }

  private buildAttachments(): { filename: string; path: string; cid: string }[] {
    if (!fs.existsSync(LOGO_PATH)) {
      this.logger.warn(`Logo não encontrada em: ${LOGO_PATH}`);
      return [];
    }
    return [{ filename: 'logo.png', path: LOGO_PATH, cid: 'almoxpert-logo' }];
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
        attachments: this.buildAttachments(),
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
    await this.send(to, 'Bem-vindo ao AlmoxPert – IFBA', welcomeTemplate(name, to, password));
  }

  async sendPasswordResetCode(to: string, name: string, code: string): Promise<void> {
    if (!this.smtpConfigured) {
      this.logger.log(`[DEV] E-mail de redefinição de senha enviado para ${name} <${this.maskEmail(to)}>`);
      return;
    }
    await this.send(to, 'Código de Redefinição de Senha – AlmoxPert', passwordResetTemplate(name, code));
  }

  async sendPasswordResetByAdmin(to: string, name: string, defaultPassword: string): Promise<void> {
    if (!this.smtpConfigured) {
      this.logger.log(`[DEV] E-mail de reset de senha (admin) enviado para ${name} <${this.maskEmail(to)}>`);
      return;
    }
    await this.send(to, 'Sua Senha foi Redefinida – AlmoxPert', passwordResetAdminTemplate(name, defaultPassword));
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
    await this.send(to, `Atualização do seu pedido #${orderId} – AlmoxPert`, orderReviewTemplate(name, orderId, status, items, adminNotes));
  }
}
