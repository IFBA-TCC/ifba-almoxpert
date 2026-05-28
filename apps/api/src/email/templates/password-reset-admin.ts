import { baseTemplate } from './base';

export const passwordResetAdminTemplate = (name: string, defaultPassword: string): string =>
  baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
      Senha redefinida pelo administrador
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Ol&aacute;, <strong style="color:#374151;">${name}</strong>.<br/>
      Um administrador redefiniu sua senha. Use a senha tempor&aacute;ria abaixo para acessar sua conta:
    </p>

    <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
        Senha tempor&aacute;ria
      </p>
      <p style="margin:0;font-size:22px;font-weight:700;color:#166534;font-family:monospace;letter-spacing:3px;">
        ${defaultPassword}
      </p>
    </div>

    <div style="background-color:#fefce8;border-left:4px solid #d97706;border-radius:6px;padding:14px 16px;margin-bottom:20px;display:flex;align-items:flex-start;gap:12px;">
      <span style="display:inline-block;width:22px;height:22px;line-height:22px;border-radius:11px;background-color:#d97706;text-align:center;font-size:13px;font-weight:900;color:#ffffff;font-family:Arial,sans-serif;mso-line-height-rule:exactly;">!</span>
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
        Ao fazer login com essa senha, voc&ecirc; ser&aacute; solicitado a criar uma nova senha segura.
      </p>
    </div>

    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
      Se voc&ecirc; n&atilde;o esperava essa altera&ccedil;&atilde;o, entre em contato com a administra&ccedil;&atilde;o do sistema.
    </p>
  `);
