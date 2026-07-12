interface BaseTemplateOptions {
  showLogo?: boolean;
}

export const baseTemplate = (
  content: string,
  { showLogo = true }: BaseTemplateOptions = {},
): string => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#ffffff;padding:28px 40px;border-bottom:1px solid #e5e7eb;">
              ${showLogo
                ? '<img src="cid:almoxpert-logo" alt="AlmoxPert IFBA" style="height:80px;width:auto;display:block;" />'
                : '<p style="margin:0;font-size:28px;font-weight:800;letter-spacing:0.5px;color:#111827;">AlmoxPert <span style="color:#16a34a;">IFBA</span></p>'
              }
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 40px 28px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                AlmoxPert &middot; IFBA<br/>
                Este é um e-mail automático, por favor não responda.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
