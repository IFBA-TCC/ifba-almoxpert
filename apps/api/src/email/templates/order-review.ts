import { baseTemplate } from './base';

export type OrderReviewStatus = 'approved' | 'approved_with_changes' | 'rejected' | 'delivered';

export interface OrderReviewItem {
  name: string;
  requestedQuantity: number;
  approvedQuantity: number | null;
  isNew?: boolean;
}

const statusConfig: Record<OrderReviewStatus, {
  color: string; bg: string; border: string; label: string;
  iconBg: string; iconChar: string;
}> = {
  delivered: {
    color:    '#1d4ed8',
    bg:       '#eff6ff',
    border:   '#bfdbfe',
    label:    'Entregue',
    iconBg:   '#2563eb',
    iconChar: '&#10004;',
  },
  approved: {
    color:    '#15803d',
    bg:       '#f0fdf4',
    border:   '#bbf7d0',
    label:    'Aprovado',
    iconBg:   '#16a34a',
    iconChar: '&#10004;',
  },
  approved_with_changes: {
    color:    '#92400e',
    bg:       '#fffbeb',
    border:   '#fde68a',
    label:    'Aprovado com alterações',
    iconBg:   '#d97706',
    iconChar: '&#33;',
  },
  rejected: {
    color:    '#b91c1c',
    bg:       '#fef2f2',
    border:   '#fecaca',
    label:    'Recusado',
    iconBg:   '#dc2626',
    iconChar: '&#215;',
  },
};

export const orderReviewTemplate = (
  name: string,
  orderId: number,
  status: OrderReviewStatus,
  items: OrderReviewItem[],
  adminNotes?: string | null,
  showLogo = true,
): string => {
  const cfg = statusConfig[status];
  const isDelivered  = status === 'delivered';
  const showApproved = status !== 'rejected';

  const iconEl = `<span style="display:inline-block;width:34px;height:34px;line-height:34px;border-radius:17px;background-color:${cfg.iconBg};text-align:center;font-size:18px;font-weight:900;color:#ffffff;font-family:Arial,sans-serif;mso-line-height-rule:exactly;">${cfg.iconChar}</span>`;

  const itemRows = items.map((item) => {
    const changed  = showApproved && !item.isNew && item.approvedQuantity !== null && item.approvedQuantity !== item.requestedQuantity;
    const rejected = showApproved && item.approvedQuantity === 0;
    const nameDisplay = item.isNew
      ? `${item.name} <span style="font-size:11px;color:#6366f1;font-weight:600;">(adicionado)</span>`
      : item.name;
    return `
      <tr style="${rejected ? 'opacity:0.5;' : ''}">
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151;">${nameDisplay}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151;text-align:center;">${item.isNew ? '&mdash;' : item.requestedQuantity}</td>
        ${showApproved ? `
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:center;${rejected ? 'color:#b91c1c;font-weight:600;' : changed ? 'color:#b45309;font-weight:600;' : 'color:#15803d;'}">
          ${rejected ? 'N&atilde;o aprovado' : (item.approvedQuantity ?? item.requestedQuantity)}${changed ? ' *' : ''}
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
    <div style="background-color:#f8fafc;border-left:4px solid #94a3b8;border-radius:6px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Observa&ccedil;&otilde;es do administrador</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${adminNotes}</p>
    </div>`
    : '';

  return baseTemplate(`
    <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111827;">
      ${isDelivered ? 'Seu pedido foi entregue!' : 'Atualiza&ccedil;&atilde;o do seu pedido'}
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Ol&aacute;, <strong style="color:#374151;">${name}</strong>.<br/>
      ${isDelivered
        ? `Seu pedido <strong>#${orderId}</strong> foi marcado como entregue pelo almoxarifado.`
        : `Seu pedido <strong>#${orderId}</strong> foi avaliado pelo administrador.`
      }
    </p>

    <div style="background-color:${cfg.bg};border:1px solid ${cfg.border};border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:14px;">
      ${iconEl}
      <p style="margin:0;font-size:15px;font-weight:700;color:${cfg.color};">Status: ${cfg.label}</p>
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
      Em caso de d&uacute;vidas, procure a administra&ccedil;&atilde;o do almoxarifado.
    </p>
  `, { showLogo });
};
