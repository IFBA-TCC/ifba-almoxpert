import { baseTemplate } from './base';

export const welcomeTemplate = (name: string, email: string, password: string, showLogo = true): string =>
  baseTemplate(`
    <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111827;">
      Bem-vindo ao AlmoxPert!
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Ol&aacute;, <strong style="color:#374151;">${name}</strong>.<br/>
      Sua conta foi criada no sistema de gest&atilde;o do almoxarifado do IFBA.
      Abaixo est&atilde;o suas credenciais de acesso:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">
            E-mail de acesso
          </p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#1e293b;font-family:monospace;">
            ${email}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">
            Senha tempor&aacute;ria
          </p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#1e293b;font-family:monospace;">
            ${password}
          </p>
        </td>
      </tr>
    </table>

    <div style="background-color:#fefce8;border-left:4px solid #d97706;border-radius:6px;padding:14px 16px;margin-bottom:24px;display:flex;align-items:flex-start;gap:12px;">
      <span style="display:inline-block;width:22px;height:22px;line-height:22px;border-radius:11px;background-color:#d97706;text-align:center;font-size:13px;font-weight:900;color:#ffffff;font-family:Arial,sans-serif;mso-line-height-rule:exactly;">!</span>
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
        <strong>Importante:</strong> no seu primeiro acesso voc&ecirc; ser&aacute; solicitado a definir
        uma nova senha pessoal. Guarde essas credenciais com seguran&ccedil;a at&eacute; l&aacute;.
      </p>
    </div>

    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
      Em caso de d&uacute;vidas, procure a administra&ccedil;&atilde;o do almoxarifado.
    </p>
  `, { showLogo });
