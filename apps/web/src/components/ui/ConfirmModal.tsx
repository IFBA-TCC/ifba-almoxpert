import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '../../utils';

export type ConfirmVariant = 'danger' | 'success' | 'primary';

interface ConfirmModalProps {
  open:          boolean;
  onClose:       () => void;
  onConfirm:     () => void;
  title:         string;
  description:   string;
  confirmLabel?: string;
  cancelLabel?:  string;
  variant?:      ConfirmVariant;
  loading?:      boolean;
}

const iconMap: Record<ConfirmVariant, { icon: React.ReactNode; bg: string }> = {
  danger:  { icon: <AlertTriangle size={22} />, bg: 'bg-red-50 text-red-500' },
  success: { icon: <CheckCircle size={22} />,   bg: 'bg-emerald-50 text-emerald-500' },
  primary: { icon: <CheckCircle size={22} />,   bg: 'bg-blue-50 text-blue-600' },
};

const btnMap: Record<ConfirmVariant, string> = {
  danger:  'btn-danger',
  success: 'btn-success',
  primary: 'btn-primary',
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  variant      = 'danger',
  loading,
}) => {
  if (!open) return null;

  const { icon, bg } = iconMap[variant];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box max-w-sm w-full">
        <div className="p-6 text-center">
          <div className={cn('w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center', bg)}>
            {icon}
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{description}</p>
          <div className="flex gap-3">
            <button className="btn-md btn-secondary flex-1" onClick={onClose} disabled={loading}>
              {cancelLabel}
            </button>
            <button
              className={cn('btn-md flex-1 btn', btnMap[variant])}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Aguarde...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
