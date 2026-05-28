import { baseTemplate } from './base';

export const passwordResetTemplate = (name: string, code: string): string =>
  baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
      Redefini&ccedil;&atilde;o de senha
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Ol&aacute;, <strong style="color:#374151;">${name}</strong>.<br/>
      Recebemos uma solicita&ccedil;&atilde;o de redefini&ccedil;&atilde;o de senha para sua conta.
      Use o c&oacute;digo abaixo para continuar:
    </p>

    <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
        C&oacute;digo de verifica&ccedil;&atilde;o
      </p>
      <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:12px;color:#1e40af;font-family:monospace;">
        ${code}
      </p>
    </div>

    <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-align:center;">
      Este c&oacute;digo expira em
      <span style="display:inline-block;background-color:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin:0 2px;">15 min</span>
    </p>
    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
      Se voc&ecirc; n&atilde;o solicitou a redefini&ccedil;&atilde;o, ignore este e-mail com seguran&ccedil;a.
    </p>
  `);
