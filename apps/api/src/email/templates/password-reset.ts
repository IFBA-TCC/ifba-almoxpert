import { baseTemplate } from './base';

export const passwordResetTemplate = (name: string, code: string): string =>
  baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
      Redefinição de senha
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Olá, <strong style="color:#374151;">${name}</strong>.<br/>
      Recebemos uma solicitação de redefinição de senha para sua conta.
      Use o código abaixo para continuar:
    </p>

    <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
        Código de verificação
      </p>
      <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:12px;color:#1e40af;font-family:monospace;">
        ${code}
      </p>
    </div>

    <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-align:center;">
      &#x23F1; Este código expira em <strong>15 minutos</strong>.
    </p>
    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
      Se você não solicitou a redefinição, ignore este e-mail com segurança.
    </p>
  `);
