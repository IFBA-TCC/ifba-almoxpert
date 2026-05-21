import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Plus, Trash2, ShieldCheck, GraduationCap, Pencil } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/FormFields';
import { usersService } from '../../services/index';
import { useToast } from '../../components/ui/Toast';
import { getInitials, formatDate } from '../../utils';
import { UserFilters, defaultFilters } from './UserFilters';
import type { UserFiltersState } from './UserFilters';
import type { User, UpdateUserDto } from '../../types';

type OutletCtx = { onMenuClick: () => void };

const createSchema = z.object({
  name:               z.string().min(2, 'Nome obrigatório'),
  email:              z.string().email('E-mail inválido'),
  password:           z.string().min(6, 'Mínimo 6 caracteres'),
  userType:           z.enum(['admin', 'student']),
  registrationNumber: z.string().optional(),
  course:             z.string().optional(),
  position:           z.string().optional(),
});
type CreateForm = z.infer<typeof createSchema>;

const editSchema = z.object({
  name:               z.string().min(2, 'Nome obrigatório'),
  email:              z.string().email('E-mail inválido'),
  password:           z.string().min(6, 'Mínimo 6 caracteres').or(z.literal('')).optional(),
  registrationNumber: z.string().optional(),
  course:             z.string().optional(),
  position:           z.string().optional(),
  isActive:           z.enum(['true', 'false']),
});
type EditForm = z.infer<typeof editSchema>;

export const UsersPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<OutletCtx>();
  const toast = useToast();
  const qc = useQueryClient();

  const [page, setPage]             = useState(1);
  const [typeFilter, setTypeFilter] = useState<'all' | 'admin' | 'student'>('all');
  const [filters, setFilters]       = useState<UserFiltersState>(defaultFilters);
  const [createModal, setCreateModal] = useState(false);
  const [deleteUser, setDeleteUser]   = useState<User | null>(null);
  const [editUserId, setEditUserId]   = useState<number | null>(null);

  const handleFiltersChange = (f: UserFiltersState) => {
    setFilters(f);
    setPage(1);
  };

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['users', page, typeFilter, filters],
    queryFn: () => usersService.list({
      pageIndex:          page - 1,
      pageSize:           10,
      userType:           typeFilter === 'all' ? undefined : typeFilter,
      name:               filters.name               || undefined,
      isActive:           filters.isActive           || undefined,
      createdFrom:        filters.createdFrom        || undefined,
      createdTo:          filters.createdTo          || undefined,
      registrationNumber: filters.registrationNumber || undefined,
      course:             filters.course             || undefined,
      position:           filters.position           || undefined,
    }),
  });

  const { data: editUserData } = useQuery({
    queryKey: ['user', editUserId],
    queryFn:  () => usersService.get(editUserId!),
    enabled:  !!editUserId,
  });

  // ── Forms ────────────────────────────────────────────────────────────────────
  const {
    register, handleSubmit, watch, reset,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { userType: 'student' },
  });
  const watchType = watch('userType');

  const {
    register: editReg, handleSubmit: editHandleSubmit,
    reset: editReset, formState: { errors: editErrors },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });
  const editUserType = editUserData?.userType;

  useEffect(() => {
    if (editUserData) {
      editReset({
        name:               editUserData.name,
        email:              editUserData.email,
        password:           '',
        registrationNumber: editUserData.studentProfile?.registrationNumber ?? '',
        course:             editUserData.studentProfile?.course ?? '',
        position:           editUserData.adminProfile?.position ?? '',
        isActive:           editUserData.isActive ? 'true' : 'false',
      });
    }
  }, [editUserData, editReset]);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado!');
      setCreateModal(false);
      reset();
    },
    onError: () => toast.error('Erro ao criar usuário.'),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateUserDto }) =>
      usersService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['user', editUserId] });
      toast.success('Usuário atualizado!');
      setEditUserId(null);
    },
    onError: () => toast.error('Erro ao atualizar usuário.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário removido.');
      setDeleteUser(null);
    },
    onError: () => toast.error('Erro ao remover usuário.'),
  });

  const onEditSubmit = (d: EditForm) => {
    const dto: UpdateUserDto = {
      name:     d.name,
      email:    d.email,
      isActive: d.isActive === 'true',
      ...(d.password ? { password: d.password } : {}),
      ...(editUserType === 'student'
        ? { registrationNumber: d.registrationNumber, course: d.course }
        : { position: d.position }),
    };
    editMutation.mutate({ id: editUserId!, dto });
  };

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'name', header: 'Usuário',
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(u.name)}
          </div>
          <div>
            <p className="font-medium text-gray-800">{u.name}</p>
            <p className="text-xs text-gray-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'userType', header: 'Tipo',
      render: (u: User) => u.userType === 'admin'
        ? <Badge className="bg-blue-50 text-blue-700"><ShieldCheck size={11} />Admin</Badge>
        : <Badge className="bg-gray-100 text-gray-600"><GraduationCap size={11} />Estudante</Badge>,
    },
    {
      key: 'detail', header: 'Detalhes',
      render: (u: User) => u.userType === 'admin'
        ? (
          <span className="text-xs text-gray-500">{u.adminProfile?.position ?? '—'}</span>
        ) : (
          <div>
            <p className="text-xs font-mono text-gray-500">{u.studentProfile?.registrationNumber ?? '—'}</p>
            <p className="text-xs text-gray-400">{u.studentProfile?.course ?? '—'}</p>
          </div>
        ),
    },
    {
      key: 'createdAt', header: 'Desde',
      render: (u: User) => <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>,
    },
    {
      key: 'isActive', header: 'Status',
      render: (u: User) => u.isActive
        ? <Badge className="bg-emerald-500Bg text-emerald-500" dot>Ativo</Badge>
        : <Badge className="bg-red-500Bg text-red-500" dot>Inativo</Badge>,
    },
    {
      key: 'actions', header: '',
      render: (u: User) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => setEditUserId(Number(u.id))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteUser(u)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500Bg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header
        title="Usuários"
        subtitle="Gerencie administradores e estudantes"
        onMenuClick={onMenuClick}
        actions={
          <Button icon={<Plus size={15} />} onClick={() => setCreateModal(true)}>
            Novo Usuário
          </Button>
        }
      />

      <div className="p-4 sm:p-6 animate-fade-in">
        <div className="card">
          {/* Type tabs */}
          <div className="px-5 py-3 border-b border-gray-100 flex gap-1">
            {(['all', 'admin', 'student'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                  setFilters((prev) => ({ ...prev, registrationNumber: '', course: '', position: '' }));
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  typeFilter === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t === 'all' ? 'Todos' : t === 'admin' ? 'Admins' : 'Estudantes'}
              </button>
            ))}
          </div>

          {/* Filters */}
          <UserFilters filters={filters} onChange={handleFiltersChange} typeFilter={typeFilter} />

          <Table
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(u) => u.id}
            loading={isLoading}
            emptyMessage="Nenhum usuário encontrado."
            emptyIcon={<Users size={32} />}
          />
          <Pagination page={page} total={data?.total ?? 0} limit={10} onPageChange={setPage} />
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        open={createModal}
        onClose={() => { setCreateModal(false); reset(); }}
        title="Novo Usuário"
        subtitle="Preencha os dados do novo usuário"
        icon={<Users size={18} />}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome Completo" placeholder="João da Silva" error={errors.name?.message} {...register('name')} />
            <Input label="E-mail" type="email" placeholder="joao@email.com" error={errors.email?.message} {...register('email')} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Senha" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            <Select
              label="Tipo de Usuário"
              options={[{ value: 'student', label: 'Estudante' }, { value: 'admin', label: 'Administrador' }]}
              error={errors.userType?.message}
              {...register('userType')}
            />
          </div>

          {watchType === 'student' ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Matrícula" placeholder="20221234" {...register('registrationNumber')} />
              <Input label="Curso" placeholder="Técnico em Informática" {...register('course')} />
            </div>
          ) : (
            <Input label="Cargo" placeholder="Assistente Social" {...register('position')} />
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => { setCreateModal(false); reset(); }}>Cancelar</Button>
            <Button type="submit" loading={createMutation.isPending}>Criar Usuário</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editUserId}
        onClose={() => setEditUserId(null)}
        title="Editar Usuário"
        subtitle="Atualize os dados do usuário"
        icon={<Pencil size={18} />}
        maxWidth="lg"
      >
        <form onSubmit={editHandleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome Completo" placeholder="João da Silva" error={editErrors.name?.message} {...editReg('name')} />
            <Input label="E-mail" type="email" placeholder="joao@email.com" error={editErrors.email?.message} {...editReg('email')} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Nova Senha"
              type="password"
              placeholder="Deixe em branco para não alterar"
              error={editErrors.password?.message}
              {...editReg('password')}
            />
            <Select
              label="Status"
              options={[{ value: 'true', label: 'Ativo' }, { value: 'false', label: 'Inativo' }]}
              error={editErrors.isActive?.message}
              {...editReg('isActive')}
            />
          </div>

          {editUserType === 'student' ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Matrícula" placeholder="20221234" {...editReg('registrationNumber')} />
              <Input label="Curso" placeholder="Técnico em Informática" {...editReg('course')} />
            </div>
          ) : (
            <Input label="Cargo" placeholder="Assistente Social" {...editReg('position')} />
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setEditUserId(null)}>Cancelar</Button>
            <Button type="submit" loading={editMutation.isPending}>Salvar Alterações</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
        title="Remover Usuário"
        description={`Tem certeza que deseja remover "${deleteUser?.name}"?`}
        confirmLabel="Remover"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
