import { baseTemplate } from './base';

export type OrderReviewStatus = 'approved' | 'approved_with_changes' | 'rejected';

export interface OrderReviewItem {
  name: string;
  requestedQuantity: number;
  approvedQuantity: number | null;
}

const statusConfig: Record<OrderReviewStatus, { color: string; bg: string; border: string; label: string; icon: string }> = {
  approved: {
    color:  '#15803d',
    bg:     '#f0fdf4',
    border: '#bbf7d0',
    label:  'Aprovado',
    icon:   '&#x2705;',
  },
  approved_with_changes: {
    color:  '#92400e',
    bg:     '#fffbeb',
    border: '#fde68a',
    label:  'Aprovado com alterações',
    icon:   '&#x26A0;',
  },
  rejected: {
    color:  '#b91c1c',
    bg:     '#fef2f2',
    border: '#fecaca',
    label:  'Cancelado',
    icon:   '&#x274C;',
  },
};

export const orderReviewTemplate = (
  name: string,
  orderId: number,
  status: OrderReviewStatus,
  items: OrderReviewItem[],
  adminNotes?: string | null,
): string => {
  const cfg = statusConfig[status];
  const showApproved = status !== 'rejected';

  const itemRows = items.map((item) => {
    const changed = showApproved && item.approvedQuantity !== null && item.approvedQuantity !== item.requestedQuantity;
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151;">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151;text-align:center;">${item.requestedQuantity}</td>
        ${showApproved ? `
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:center;${changed ? `color:#b45309;font-weight:600;` : `color:#15803d;`}">
          ${item.approvedQuantity ?? item.requestedQuantity}${changed ? ' *' : ''}
        </td>` : ''}
      </tr>`;
  }).join('');

  const tableHeader = `
    <tr style="background-color:#f8fafc;">
      <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
      <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Solicitado</th>
      ${showApproved ? `<th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Aprovado</th>` : ''}
    </tr>`;

  const changedLegend = status === 'approved_with_changes'
    ? `<p style="margin:8px 0 0;font-size:11px;color:#92400e;">* Quantidade diferente da solicitada</p>`
    : '';

  const notesSection = adminNotes
    ? `
    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Observações do administrador</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${adminNotes}</p>
    </div>`
    : '';

  return baseTemplate(`
    <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111827;">
      Atualização do seu pedido
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Olá, <strong style="color:#374151;">${name}</strong>.<br/>
      Seu pedido <strong>#${orderId}</strong> foi avaliado pelo administrador.
    </p>

    <div style="background-color:${cfg.bg};border:1px solid ${cfg.border};border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:20px;">${cfg.icon}</span>
      <div>
        <p style="margin:0;font-size:15px;font-weight:700;color:${cfg.color};">Status: ${cfg.label}</p>
      </div>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:8px;">
      ${tableHeader}
      ${itemRows}
    </table>
    ${changedLegend}

    <div style="height:20px;"></div>

    ${notesSection}

    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
      Em caso de dúvidas, procure a administração do almoxarifado.
    </p>
  `);
};
