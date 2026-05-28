import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { OrderStatus, ShipmentStatus, MovementType } from '../types';

export const formatDate = (date: string | null | undefined, pattern = 'dd/MM/yyyy') => {
  if (!date) return '—';
  try {
    return format(parseISO(date), pattern, { locale: ptBR });
  } catch {
    return '—';
  }
};

export const formatDateTime = (date: string | null | undefined) => {
  if (!date) return '—';
  try {
    return format(parseISO(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '—';
  }
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending:   'Pendente',
  approved:  'Aprovado',
  rejected:  'Recusado',
  delivered: 'Entregue',
};

export const orderStatusColor: Record<OrderStatus, string> = {
  pending:   'bg-violet-100 text-violet-700',
  approved:  'bg-blue-100 text-blue-700',
  rejected:  'bg-red-100 text-red-600',
  delivered: 'bg-emerald-100 text-emerald-700',
};

export const shipmentStatusLabel: Record<ShipmentStatus, string> = {
  open:      'Aberta',
  completed: 'Finalizada',
  cancelled: 'Cancelada',
};

export const shipmentStatusColor: Record<ShipmentStatus, string> = {
  open:      'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

export const movementTypeLabel: Record<MovementType, string> = {
  in:  'Entrada',
  out: 'Saída',
};

export const movementTypeColor: Record<MovementType, string> = {
  in:  'bg-emerald-100 text-emerald-700',
  out: 'bg-red-100 text-red-600',
};

export const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

const AID_COLORS: { match: string; cls: string }[] = [
  { match: 'Alimentação',        cls: 'bg-green-100  text-green-700'  },
  { match: 'Transporte Munici',  cls: 'bg-blue-100   text-blue-700'   },
  { match: 'Transporte Intermu', cls: 'bg-indigo-100 text-indigo-700' },
  { match: 'Moradia',            cls: 'bg-orange-100 text-orange-700' },
  { match: 'Cópia',              cls: 'bg-purple-100 text-purple-700' },
  { match: 'Bolsa',              cls: 'bg-yellow-100 text-yellow-700' },
];

export const aidColor = (aid: string): string => {
  const found = AID_COLORS.find((c) => aid.includes(c.match));
  return found?.cls ?? 'bg-gray-100 text-gray-600';
};

export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');