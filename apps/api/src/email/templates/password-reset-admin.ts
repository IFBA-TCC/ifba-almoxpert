import { baseTemplate } from './base';

export const passwordResetAdminTemplate = (name: string, defaultPassword: string): string =>
  baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
      Senha redefinida pelo administrador
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Olá, <strong style="color:#374151;">${name}</strong>.<br/>
      Um administrador redefiniu sua senha. Use a senha temporária abaixo para acessar sua conta:
    </p>

    <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
        Senha temporária
      </p>
      <p style="margin:0;font-size:22px;font-weight:700;color:#166534;font-family:monospace;letter-spacing:3px;">
        ${defaultPassword}
      </p>
    </div>

    <div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
        &#x26A0; Ao fazer login com essa senha, você será solicitado a criar uma nova senha segura.
      </p>
    </div>

    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
      Se você não esperava essa alteração, entre em contato com a administração do sistema.
    </p>
  `);
