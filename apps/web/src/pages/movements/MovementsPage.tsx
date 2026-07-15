import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowLeftRight, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { FilterBar, type FilterFieldDef } from '../../components/ui/FilterBar';
import { movementsService } from '../../services/index';
import { formatDateTime, movementTypeLabel, movementTypeColor } from '../../utils';
import type { Movement } from '../../types';

type OutletCtx = { onMenuClick: () => void };

interface MovementFilters {
  itemName: string;
  movementType: string;
  originType: string;
  originId: string;
  dateFrom: string;
  dateTo: string;
}

const defaultFilters: MovementFilters = {
  itemName: '',
  movementType: '',
  originType: '',
  originId: '',
  dateFrom: '',
  dateTo: '',
};

const movementFilterFields: FilterFieldDef[] = [
  { key: 'itemName',     label: 'Item',           type: 'text',   placeholder: 'Buscar por item...' },
  { key: 'movementType', label: 'Tipo',           type: 'select', placeholder: 'Tipo de movimentação', options: [{ value: 'in', label: 'Entrada' }, { value: 'out', label: 'Saída' }] },
  { key: 'originType',   label: 'Origem',         type: 'select', placeholder: 'Origem', options: [{ value: 'shipment', label: 'Remessa' }, { value: 'order', label: 'Pedido' }] },
  { key: 'originId',     label: 'Nº Remessa/Pedido', type: 'number', placeholder: 'Nº remessa / pedido...' },
  { key: 'dateFrom',     label: 'Data inicial',   type: 'date' },
  { key: 'dateTo',       label: 'Data final',     type: 'date' },
];

export const MovementsPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<OutletCtx>();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<MovementFilters>(defaultFilters);

  const { data, isLoading } = useQuery({
    queryKey: ['movements', page, filters],
    queryFn: () =>
      movementsService.list({
        pageIndex:    page - 1,
        pageSize:     15,
        itemName:     filters.itemName     || undefined,
        movementType: filters.movementType || undefined,
        originType:   filters.originType   || undefined,
        originId:     filters.originId     ? Number(filters.originId) : undefined,
        dateFrom:     filters.dateFrom     || undefined,
        dateTo:       filters.dateTo       || undefined,
      }),
  });

  const columns = [
    {
      key: 'type',
      header: 'Tipo',
      render: (mv: Movement) => (
        <div className="flex items-center gap-2">
          {mv.movementType === 'in'
            ? <ArrowDownCircle size={16} className="text-emerald-500" />
            : <ArrowUpCircle   size={16} className="text-red-500" />
          }
          <Badge className={movementTypeColor[mv.movementType]} dot>
            {movementTypeLabel[mv.movementType]}
          </Badge>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Item',
      render: (mv: Movement) => (
        <div>
          <p className="font-medium text-gray-800">{mv.item?.name}</p>
          <p className="text-xs text-gray-500">
            {mv.variation?.description ?? '—'}
            {mv.size && mv.size !== 'none' && (
              <span className="ml-1 font-semibold text-blue-500">{mv.size}</span>
            )}
          </p>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantidade',
      render: (mv: Movement) => (
        <span className={`font-mono font-semibold text-sm ${mv.movementType === 'in' ? 'text-emerald-500' : 'text-red-500'}`}>
          {mv.movementType === 'in' ? '+' : '-'}{mv.quantity}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Origem',
      render: (mv: Movement) => (
        <Badge className="bg-gray-100 text-gray-600">
          {mv.originType === 'shipment' ? 'Remessa' : 'Pedido'} #{mv.originId}
        </Badge>
      ),
    },
    {
      key: 'notes',
      header: 'Observações',
      render: (mv: Movement) => (
        <span className="text-sm text-gray-500 truncate max-w-xs block">
          {(mv as any).notes || '—'}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Data',
      render: (mv: Movement) => (
        <span className="text-sm text-gray-500 whitespace-nowrap">{formatDateTime(mv.movementDate)}</span>
      ),
    },
  ];

  return (
    <div>
      <Header
        title="Movimentações"
        subtitle="Histórico completo de entradas e saídas"
        onMenuClick={onMenuClick}
      />

      <div className="p-4 sm:p-6 animate-fade-in">
        <div className="card">
          <FilterBar
            filters={filters}
            defaults={defaultFilters}
            fields={movementFilterFields}
            onChange={(f) => { setFilters(f); setPage(1); }}
          />

          <Table
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(mv) => mv.id}
            loading={isLoading}
            emptyMessage="Nenhuma movimentação encontrada."
            emptyIcon={<ArrowLeftRight size={32} />}
          />
          <Pagination page={page} total={data?.total ?? 0} limit={15} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
};
