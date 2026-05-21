# AlmoxPert — Frontend

Interface web do sistema de gestão de almoxarifado do IFBA Campus Vitória da Conquista.

## Stack

| Camada        | Tecnologia |
|---------------|------------|
| Framework     | React 18 + TypeScript |
| Build         | Vite |
| Estilos       | Tailwind CSS v3 |
| Roteamento    | React Router DOM v6 |
| Estado global | Zustand (com persistência) |
| Formulários   | React Hook Form + Zod |
| Data fetching | TanStack Query v5 |
| HTTP          | Axios |
| Ícones        | Lucide React |
| Datas         | date-fns + ptBR locale |

## Estrutura

```
src/
├── types/          # Todos os tipos TypeScript (DTOs, entidades)
├── services/       # Camada de API (authService, itemsService, etc.)
├── store/          # Zustand stores (authStore com persistência)
├── utils/          # Helpers (formatação de datas, classes de cor, cn())
├── hooks/          # Custom hooks
├── components/
│   ├── ui/         # Button, Input, Select, Table, Modal, Badge, Pagination, Toast, StatCard
│   ├── layout/     # Sidebar, Header, AppLayout
│   └── modals/     # ItemModal, etc.
└── pages/
    ├── auth/       # Login
    ├── dashboard/  # Dashboard com stats e feeds
    ├── items/      # CRUD completo de itens
    ├── stock/      # Visualização e edição de estoque
    ├── shipments/  # Remessas (admin)
    ├── orders/     # Pedidos (admin + estudante)
    ├── movements/  # Histórico de movimentações (admin)
    └── users/      # Gestão de usuários (admin)
```

## Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variável de ambiente
cp .env.example .env
# Edite VITE_API_URL para apontar para o backend

# 3. Iniciar em desenvolvimento
npm run dev

# 4. Build de produção
npm run build
```

## Variáveis de Ambiente

| Variável     | Padrão                  | Descrição         |
|--------------|-------------------------|-------------------|
| VITE_API_URL | http://localhost:3000   | URL do backend    |

## Funcionalidades

- **Autenticação** — Login com JWT, sessão persistida via Zustand
- **RBAC** — Rotas e menus condicionais por papel (admin/estudante)
- **Dashboard** — Stats em tempo real, feed de pedidos e movimentações
- **Itens** — Listagem paginada, busca, criação/edição em modal com variações dinâmicas
- **Estoque** — Visão de quantidades, filtro de estoque baixo, edição de mínimo
- **Remessas** — Criação com múltiplos itens, controle de status
- **Pedidos** — Criação, aprovação/recusa com quantidades individuais, entrega
- **Movimentações** — Histórico auditável de entradas/saídas
- **Usuários** — Criação de admins e estudantes com perfis específicos
- **Responsivo** — Sidebar colapsável, menu mobile, tabelas com scroll horizontal
- **Toast** — Notificações de feedback para todas as operações
- **Modais** — Criação e edição sem navegação de página
