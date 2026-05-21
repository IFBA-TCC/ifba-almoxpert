import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package, AlertTriangle, ShoppingCart, Users, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { stockService } from '../../services/stockService';
import { ordersService } from '../../services/index';
import { movementsService } from '../../services/index';
import { usersService } from '../../services/index';
import { itemsService } from '../../services/itemsService';
import { formatDateTime, orderStatusLabel, orderStatusColor, movementTypeLabel, movementTypeColor } from '../../utils';
import { useAuthStore } from '../../store/authStore';

type OutletCtx = { onMenuClick: () => void };

export const DashboardPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<OutletCtx>();
  const { user } = useAuthStore();
  const isAdmin = user?.userType === 'admin';

  const { data: itemsData }     = useQuery({ queryKey: ['items-count'],    queryFn: () => itemsService.list({ pageSize: 1 }) });
  const { data: lowStockData }  = useQuery({ queryKey: ['low-stock'],      queryFn: () => stockService.listLow({ pageSize: 1 }), enabled: isAdmin });
  const { data: pendingOrders } = useQuery({ queryKey: ['pending-orders'], queryFn: () => ordersService.list({ status: 'pending', pageSize: 1 }), enabled: isAdmin });
  const { data: usersData }     = useQuery({ queryKey: ['users-count'],    queryFn: () => usersService.list({ pageSize: 1 }), enabled: isAdmin });
  const { data: movementsData } = useQuery({ queryKey: ['recent-movements'], queryFn: () => movementsService.list({ pageSize: 8 }), enabled: isAdmin });
  const { data: ordersData }    = useQuery({ queryKey: ['recent-orders'],    queryFn: () => ordersService.list({ pageSize: 8 }) });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`${greeting}, ${user?.name?.split(' ')[0]}! Veja o resumo do sistema.`}
        onMenuClick={onMenuClick}
      />

      <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Itens"
            value={itemsData?.total ?? '—'}
            icon={<Package size={18} />}
            color="blue"
            subtitle="Itens cadastrados"
          />
          {isAdmin && (
            <>
              <StatCard
                title="Estoque Baixo"
                value={lowStockData?.total ?? '—'}
                icon={<AlertTriangle size={18} />}
                color="yellow"
                subtitle="Abaixo do mínimo"
              />
              <StatCard
                title="Pedidos Pendentes"
                value={pendingOrders?.total ?? '—'}
                icon={<ShoppingCart size={18} />}
                color="purple"
                subtitle="Aguardando aprovação"
              />
              <StatCard
                title="Usuários"
                value={usersData?.total ?? '—'}
                icon={<Users size={18} />}
                color="green"
                subtitle="Cadastrados no sistema"
              />
            </>
          )}
        </div>

        <div className={`grid gap-6 ${isAdmin ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          {/* Recent Orders */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Pedidos Recentes</h3>
              <ShoppingCart size={16} className="text-gray-400" />
            </div>
            <div className="divide-y divide-gray-50">
              {ordersData?.data?.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-8">Nenhum pedido.</p>
              )}
              {ordersData?.data?.slice(0, 6).map((order) => (
                <div key={order.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Pedido #{order.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.user?.name} — {formatDateTime(order.createdAt)}</p>
                  </div>
                  <Badge className={orderStatusColor[order.status]} dot>
                    {orderStatusLabel[order.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Movements */}
          {isAdmin && (
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Movimentações Recentes</h3>
                <div className="flex gap-1">
                  <ArrowDownCircle size={16} className="text-emerald-500" />
                  <ArrowUpCircle   size={16} className="text-red-500"  />
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {movementsData?.data?.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-8">Nenhuma movimentação.</p>
                )}
                {movementsData?.data?.slice(0, 6).map((mv) => (
                  <div key={mv.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{mv.item?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {mv.variation?.description}
                        {mv.size && mv.size !== 'none' && ` (${mv.size})`}
                        {' '}— {mv.quantity} un. — {formatDateTime(mv.movementDate)}
                      </p>
                    </div>
                    <Badge className={movementTypeColor[mv.movementType]} dot>
                      {movementTypeLabel[mv.movementType]}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
