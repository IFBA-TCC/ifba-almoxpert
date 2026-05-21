import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TruckIcon, Plus, Eye, CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { Select, Input, Textarea } from '../../components/ui/FormFields';
import { shipmentsService } from '../../services/index';
import { itemsService } from '../../services/itemsService';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime, shipmentStatusLabel, shipmentStatusColor } from '../../utils';
import type { Shipment, Item } from '../../types';

const CLOTHING_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'GGG'];
const SHOE_SIZES = ['33','34','35','36','37','38','39','40','41','42','43','44','45'];

function getSizeOptions(item?: Item) {
  if (!item || item.sizeType === 'none') return null;
  const sizes = item.sizeType === 'clothing' ? CLOTHING_SIZES : SHOE_SIZES;
  return sizes.map((s) => ({ value: s, label: s }));
}

type OutletCtx = { onMenuClick: () => void };
type FormLine  = { itemId: string; variationId: string; size: string; quantity: number };
type FormData  = { notes: string; items: FormLine[] };

const EMPTY_LINE: FormLine = { itemId: '', variationId: '', size: '', quantity: 1 };

// ─── Shared: form linhas de remessa ──────────────────────────────────────────
function ShipmentFormLines({
  fields, register, control, watch, setValue, errors, remove, append, allItems,
}: {
  fields:    ReturnType<typeof useFieldArray>['fields'];
  register:  any;
  control:   any;
  watch:     any;
  setValue:  any;
  errors:    any;
  remove:    (idx: number) => void;
  append:    (v: FormLine) => void;
  allItems:  Item[];
}) {
  const watchedItems = watch('items');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-2 px-0.5">
        <p className="col-span-3 label mb-0">Item *</p>
        <p className="col-span-3 label mb-0">Variação</p>
        <p className="col-span-3 label mb-0">Tamanho</p>
        <p className="col-span-2 label mb-0">Qtd. *</p>
        <div className="col-span-1" />
      </div>

      {fields.map((field, idx) => {
        const selItemId   = watchedItems?.[idx]?.itemId;
        const selItem     = allItems.find((it) => String(it.id) === selItemId);
        const sizeOptions = getSizeOptions(selItem);
        const lineErrors  = errors?.items?.[idx];

        return (
          <div key={field.id}>
            <div className="grid grid-cols-12 gap-2 items-start">
              {/* Item */}
              <div className="col-span-3">
                <Controller
                  name={`items.${idx}.itemId`}
                  control={control}
                  rules={{ required: 'Selecione um item' }}
                  render={({ field: f }) => (
                    <Select
                      options={allItems.map((it) => ({ value: String(it.id), label: it.name }))}
                      placeholder="Selecione..."
                      value={f.value}
                      error={lineErrors?.itemId?.message}
                      onChange={(e) => {
                        f.onChange(e);
                        setValue(`items.${idx}.variationId`, '');
                        setValue(`items.${idx}.size`, '');
                      }}
                    />
                  )}
                />
              </div>

              {/* Variação */}
              <div className="col-span-3">
                {selItem?.hasVariations ? (
                  <Select
                    options={[
                      { value: '', label: 'Selecione...' },
                      ...(selItem.variations?.filter((v) => v.isActive).map((v) => ({
                        value: String(v.id),
                        label: v.description,
                      })) ?? []),
                    ]}
                    error={lineErrors?.variationId?.message}
                    {...register(`items.${idx}.variationId`, {
                      validate: (val: string) => {
                        const item = allItems.find((it) => String(it.id) === watchedItems?.[idx]?.itemId);
                        if (item?.hasVariations && !val) return 'Selecione uma variação';
                        return true;
                      },
                    })}
                  />
                ) : (
                  <div className="h-[42px] flex items-center px-3 text-xs text-gray-400 bg-gray-50 rounded-xl border border-gray-200">
                    {selItem ? 'Sem variação' : '—'}
                  </div>
                )}
              </div>

              {/* Tamanho */}
              <div className="col-span-3">
                {sizeOptions ? (
                  <Select
                    options={[{ value: '', label: 'Selecione...' }, ...sizeOptions]}
                    error={lineErrors?.size?.message}
                    {...register(`items.${idx}.size`, {
                      validate: (val: string) => {
                        const item = allItems.find((it) => String(it.id) === watchedItems?.[idx]?.itemId);
                        if (item && item.sizeType !== 'none' && !val) return 'Selecione um tamanho';
                        return true;
                      },
                    })}
                  />
                ) : (
                  <div className="h-[42px] flex items-center px-3 text-xs text-gray-400 bg-gray-50 rounded-xl border border-gray-200">
                    {selItem ? 'Sem tamanho' : '—'}
                  </div>
                )}
              </div>

              {/* Quantidade */}
              <div className="col-span-2">
                <Input
                  type="number"
                  min={1}
                  placeholder="0"
                  error={lineErrors?.quantity?.message}
                  {...register(`items.${idx}.quantity`, {
                    valueAsNumber: true,
                    required: 'Obrigatório',
                    min: { value: 1, message: 'Mín. 1' },
                    validate: (v: number) => (Number.isFinite(v) && v >= 1) || 'Mín. 1',
                  })}
                />
              </div>

              {/* Remover */}
              <div className="col-span-1">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="w-9 h-[42px] flex items-center justify-center text-red-500 hover:bg-red-500Bg rounded-xl transition-colors"
                  >×</button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<Plus size={13} />}
        onClick={() => append({ ...EMPTY_LINE })}
      >
        Adicionar Item
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export const ShipmentsPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<OutletCtx>();
  const toast = useToast();
  const qc    = useQueryClient();

  const [page, setPage]                   = useState(1);
  const [viewShipment, setView]           = useState<Shipment | null>(null);
  const [createOpen, setCreate]           = useState(false);
  const [editShipment, setEditOpen]       = useState<Shipment | null>(null);
  const [deleteShipment, setDeleteOpen]   = useState<Shipment | null>(null);
  const [completeShipment, setCompleteOpen] = useState<Shipment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['shipments', page],
    queryFn: () => shipmentsService.list({ pageIndex: page - 1, pageSize: 10 }),
  });

  const { data: itemsData } = useQuery({
    queryKey: ['items-all'],
    queryFn: () => itemsService.list({ pageSize: 200, isActive: true }),
  });

  const allItems = itemsData?.data ?? [];

  // ── Create form ──
  const createForm = useForm<FormData>({
    defaultValues: { notes: '', items: [{ ...EMPTY_LINE }] },
  });
  const createFields = useFieldArray({ control: createForm.control, name: 'items' });

  // ── Edit form ──
  const editForm = useForm<FormData>({
    defaultValues: { notes: '', items: [{ ...EMPTY_LINE }] },
  });
  const editFields = useFieldArray({ control: editForm.control, name: 'items' });

  // Pré-preenche o form de edição quando uma remessa é selecionada
  useEffect(() => {
    if (editShipment) {
      editForm.reset({
        notes: editShipment.notes ?? '',
        items: editShipment.items?.length
          ? editShipment.items.map((i) => ({
              itemId:      String(i.itemId),
              variationId: i.variationId ? String(i.variationId) : '',
              size:        i.size === 'none' ? '' : (i.size ?? ''),
              quantity:    i.quantity,
            }))
          : [{ ...EMPTY_LINE }],
      });
    }
  }, [editShipment]);

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: shipmentsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      toast.success('Remessa criada!');
      setCreate(false);
      createForm.reset({ notes: '', items: [{ ...EMPTY_LINE }] });
    },
    onError: () => toast.error('Erro ao criar remessa.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Parameters<typeof shipmentsService.update>[1] }) =>
      shipmentsService.update(id, dto),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      toast.success('Remessa atualizada!');
      setEditOpen(null);
      // Atualiza o modal de visualização se ainda estiver aberto
      if (viewShipment?.id === updated.id) setView(updated);
    },
    onError: () => toast.error('Erro ao atualizar remessa.'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => shipmentsService.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      toast.success('Remessa concluída! Estoque atualizado.');
      setView(null);
      setCompleteOpen(null);
    },
    onError: () => toast.error('Erro ao concluir remessa.'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => shipmentsService.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Remessa cancelada.'); setView(null); },
    onError: () => toast.error('Erro ao cancelar remessa.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => shipmentsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      toast.success('Remessa excluída.');
      setDeleteOpen(null);
      setView(null);
    },
    onError: () => toast.error('Erro ao excluir remessa.'),
  });

  // ── Helpers ──
  function buildPayload(d: FormData) {
    return {
      notes: d.notes,
      items: d.items.map((i) => {
        const selItem = allItems.find((it) => String(it.id) === i.itemId);
        return {
          itemId:      Number(i.itemId),
          variationId: selItem?.hasVariations ? Number(i.variationId) || undefined : undefined,
          size:        i.size || 'none',
          quantity:    i.quantity,
        };
      }),
    };
  }

  const columns = [
    { key: 'id', header: '#',
      render: (s: Shipment) => <span className="font-mono text-gray-500 text-xs">#{s.id}</span> },
    {
      key: 'responsible', header: 'Responsável',
      render: (s: Shipment) => (
        <div>
          <p className="font-medium text-gray-800">{s.responsible?.name}</p>
          <p className="text-xs text-gray-400">{formatDateTime(s.createdAt)}</p>
        </div>
      ),
    },
    { key: 'items_count', header: 'Itens',
      render: (s: Shipment) => <span className="text-sm text-gray-600">{s.items?.length ?? 0} item(ns)</span> },
    { key: 'status', header: 'Status',
      render: (s: Shipment) => <Badge className={shipmentStatusColor[s.status]} dot>{shipmentStatusLabel[s.status]}</Badge> },
    {
      key: 'actions', header: '',
      render: (s: Shipment) => (
        <div className="flex items-center gap-1 justify-end">
          {s.status === 'open' && (
            <>
              <button
                title="Editar remessa"
                onClick={() => setEditOpen(s)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                title="Excluir remessa"
                onClick={() => setDeleteOpen(s)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500Bg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          <button
            title="Visualizar remessa"
            onClick={() => setView(s)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header
        title="Remessas"
        subtitle="Entradas de material no almoxarifado"
        onMenuClick={onMenuClick}
        actions={<Button icon={<Plus size={15} />} onClick={() => setCreate(true)}>Nova Remessa</Button>}
      />

      <div className="p-4 sm:p-6 animate-fade-in">
        <div className="card">
          <Table
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(s) => s.id}
            loading={isLoading}
            emptyMessage="Nenhuma remessa encontrada."
            emptyIcon={<TruckIcon size={32} />}
          />
          <Pagination page={page} total={data?.total ?? 0} limit={10} onPageChange={setPage} />
        </div>
      </div>

      {/* ── View Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={!!viewShipment}
        onClose={() => setView(null)}
        title={`Remessa #${viewShipment?.id}`}
        subtitle={viewShipment ? formatDateTime(viewShipment.createdAt) : ''}
        icon={<TruckIcon size={18} />}
        maxWidth="lg"
      >
        {viewShipment && (
          <div className="space-y-4">
            <Badge className={shipmentStatusColor[viewShipment.status]} dot>
              {shipmentStatusLabel[viewShipment.status]}
            </Badge>
            {viewShipment.notes && (
              <p className="text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl">{viewShipment.notes}</p>
            )}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="table-header text-left">Item</th>
                    <th className="table-header text-left">Variação</th>
                    <th className="table-header text-left">Tamanho</th>
                    <th className="table-header text-right">Qtd.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {viewShipment.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="table-cell">{item.item?.name}</td>
                      <td className="table-cell text-gray-400">{item.variation?.description ?? '—'}</td>
                      <td className="table-cell text-gray-400">{item.size === 'none' ? '—' : item.size}</td>
                      <td className="table-cell text-right font-mono">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {viewShipment.status === 'open' && (
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <Button
                  variant="secondary"
                  icon={<Pencil size={14} />}
                  onClick={() => { setView(null); setEditOpen(viewShipment); }}
                >
                  Editar
                </Button>
                <button
                  title="Excluir remessa"
                  onClick={() => setDeleteOpen(viewShipment)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500Bg border border-gray-200 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
                <Button
                  variant="danger"
                  icon={<XCircle size={15} />}
                  loading={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate(viewShipment.id)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  icon={<CheckCircle size={15} />}
                  onClick={() => setCompleteOpen(viewShipment)}
                >
                  Finalizar
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Create Modal ───────────────────────────────────────────────────── */}
      <Modal
        open={createOpen}
        onClose={() => { setCreate(false); createForm.reset({ notes: '', items: [{ ...EMPTY_LINE }] }); }}
        title="Nova Remessa"
        subtitle="Registre uma entrada de materiais"
        icon={<TruckIcon size={18} />}
        maxWidth="xl"
      >
        <form
          onSubmit={createForm.handleSubmit((d) => createMutation.mutate(buildPayload(d)))}
          className="space-y-4"
        >
          <Textarea
            label="Observações"
            placeholder="Notas sobre a remessa (opcional)..."
            {...createForm.register('notes')}
          />
          <ShipmentFormLines
            fields={createFields.fields}
            register={createForm.register}
            control={createForm.control}
            watch={createForm.watch}
            setValue={createForm.setValue}
            errors={createForm.formState.errors}
            remove={createFields.remove}
            append={createFields.append}
            allItems={allItems}
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => { setCreate(false); createForm.reset({ notes: '', items: [{ ...EMPTY_LINE }] }); }}>
              Cancelar
            </Button>
            <Button type="submit" loading={createMutation.isPending}>Criar Remessa</Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={!!editShipment}
        onClose={() => setEditOpen(null)}
        title={`Editar Remessa #${editShipment?.id}`}
        subtitle="Apenas remessas abertas podem ser editadas"
        icon={<Pencil size={18} />}
        maxWidth="xl"
      >
        <form
          onSubmit={editForm.handleSubmit((d) =>
            updateMutation.mutate({ id: editShipment!.id, dto: buildPayload(d) })
          )}
          className="space-y-4"
        >
          <Textarea
            label="Observações"
            placeholder="Notas sobre a remessa (opcional)..."
            {...editForm.register('notes')}
          />
          <ShipmentFormLines
            fields={editFields.fields}
            register={editForm.register}
            control={editForm.control}
            watch={editForm.watch}
            setValue={editForm.setValue}
            errors={editForm.formState.errors}
            remove={editFields.remove}
            append={editFields.append}
            allItems={allItems}
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(null)}>
              Cancelar
            </Button>
            <Button type="submit" loading={updateMutation.isPending}>Salvar Alterações</Button>
          </div>
        </form>
      </Modal>
      {/* ── Confirm Complete Modal ─────────────────────────────────────────── */}
      <ConfirmModal
        open={!!completeShipment}
        onClose={() => setCompleteOpen(null)}
        onConfirm={() => completeShipment && completeMutation.mutate(completeShipment.id)}
        title="Finalizar Remessa"
        description={`Confirma a conclusão da Remessa #${completeShipment?.id}? Os ${completeShipment?.items?.length ?? 0} item(ns) serão lançados no estoque e a remessa não poderá mais ser editada.`}
        confirmLabel="Sim, finalizar"
        variant="success"
        loading={completeMutation.isPending}
      />

      {/* ── Confirm Delete Modal ───────────────────────────────────────────── */}
      <ConfirmModal
        open={!!deleteShipment}
        onClose={() => setDeleteOpen(null)}
        onConfirm={() => deleteShipment && deleteMutation.mutate(deleteShipment.id)}
        title="Excluir Remessa"
        description={`Tem certeza que deseja excluir permanentemente a Remessa #${deleteShipment?.id}? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
