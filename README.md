# AlmoxPert 📦

> **AlmoxPert** é um sistema completo de gerenciamento de almoxarifado (warehouse management system) desenvolvido para a IFBA. Permite controle total de inventário, entrada de materiais, requisições de alunos e auditoria de movimentações.

---

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Reference](#api-reference)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Desenvolvimento](#desenvolvimento)
- [Build e Produção](#build-e-produção)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

AlmoxPert é uma API REST completa para gerenciamento de almoxarifado que oferece:

### Funcionalidades Principais

- **👥 Gestão de Usuários**: Administradores e alunos com controle de acesso baseado em funções (RBAC)
- **📦 Catálogo de Itens**: Gerenciamento de itens com variações (cores, tamanhos, etc.)
- **📊 Controle de Estoque**: Rastreamento em tempo real de inventário com alertas de baixo estoque
- **📥 Entrada de Materiais**: Registro de recebimentos (shipments) com validação de responsável
- **📋 Requisições de Alunos**: Sistema de pedidos com fluxo de aprovação por administradores
- **📝 Auditoria Completa**: Log detalhado de todas as movimentações de estoque
- **🔐 Segurança**: Autenticação JWT com senhas criptografadas em bcrypt

---

## 🛠️ Tecnologias

### Backend
- **[NestJS](https://nestjs.com/)** v10.3.9 - Framework Node.js progressivo
- **[TypeORM](https://typeorm.io/)** v0.3.20 - ORM para JavaScript/TypeScript
- **[TypeScript](https://www.typescriptlang.org/)** v5.4.5 - Programação tipada

### Database
- **MySQL** 8.0+ - Banco de dados relacional

### Autenticação & Segurança
- **[Passport.js](http://www.passportjs.org/)** - Estratégia JWT
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Hash de senhas
- **[JWT](https://jwt.io/)** - Tokens de autenticação

### Documentação
- **[Swagger/OpenAPI](https://swagger.io/)** - Documentação interativa da API

### Ferramentas
- **[Yarn](https://yarnpkg.com/)** - Gerenciador de pacotes
- **[Docker & Docker Compose](https://www.docker.com/)** - Containerização
- **[Jest](https://jestjs.io/)** - Framework de testes

---

## ✅ Requisitos

### Sistema
- **Node.js** >= 18.x
- **Yarn** >= 3.x
- **Docker** & **Docker Compose** (opcional, para ambiente completo)
- **MySQL** 8.0+ (local ou via Docker)
- **Git**

### Verificar Instalação
```bash
node --version      # v18.x ou superior
yarn --version      # 3.x ou superior
docker --version    # Docker version (opcional)
mysql --version     # mysql Ver 8.0+ (opcional se usar Docker)
```

---

## 📦 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/ifba-backend-almoxpert.git
cd ifba-backend-almoxpert
```

### 2. Instalar Dependências

```bash
yarn install
```

Isso instalará todas as dependências do monorepo, incluindo a API em `apps/api`.

### 3. Configurar Banco de Dados

#### Opção A: Docker (Recomendado)

```bash
docker-compose up -d
```

Isso inicia um container MySQL com as credenciais padrão.

#### Opção B: MySQL Local

Crie o banco de dados manualmente:

```bash
mysql -u root -p < database/init.sql
```

Será solicitada sua senha do MySQL. O script criará:
- Banco de dados `almoxpert`
- Tabelas necessárias com estrutura completa

---

## ⚙️ Configuração

### 1. Criar Arquivo `.env`

```bash
cp apps/api/.env.example apps/api/.env
```

### 2. Editar Variáveis de Ambiente

Abra `apps/api/.env` e configure:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=seu_password
DATABASE_NAME=almoxpert

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRATION=24h

# API
PORT=3000
NODE_ENV=development
```

### Variáveis Importantes

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_HOST` | Host do MySQL | localhost |
| `DATABASE_PORT` | Porta do MySQL | 3306 |
| `DATABASE_USER` | Usuário MySQL | root |
| `DATABASE_PASSWORD` | Senha MySQL | *(necessário)* |
| `DATABASE_NAME` | Nome do banco | almoxpert |
| `JWT_SECRET` | Chave JWT (min 32 chars) | *(necessário)* |
| `JWT_EXPIRATION` | Expiração do token | 24h |
| `PORT` | Porta da API | 3000 |
| `NODE_ENV` | Ambiente | development |

---

## 🚀 Como Executar

### Modo Desenvolvimento

Inicia o servidor com hot-reload:

```bash
yarn dev
```

A API estará disponível em: **http://localhost:3000**

Swagger/OpenAPI em: **http://localhost:3000/api/docs**

### Modo Produção (Build + Start)

```bash
# 1. Compilar TypeScript
yarn build

# 2. Executar versão compilada
yarn start
```

### Com Docker Compose

```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up

# Produção
docker-compose up -d
```

---

## 📁 Estrutura do Projeto

```
ifba-backend-almoxpert/
├── apps/
│   └── api/                          # NestJS API principal
│       ├── src/
│       │   ├── app.module.ts         # Módulo principal
│       │   ├── main.ts               # Ponto de entrada
│       │   ├── shared.ts             # Tipos compartilhados
│       │   ├── auth/                 # Autenticação (JWT, estratégia)
│       │   ├── common/               # Decoradores, guards, filtros
│       │   ├── users/                # Gestão de usuários
│       │   ├── items/                # Itens e variações
│       │   ├── stock/                # Controle de estoque
│       │   ├── shipments/            # Entrada de materiais
│       │   ├── orders/               # Requisições de alunos
│       │   ├── movements/            # Auditoria de movimentações
│       │   └── health/               # Health check
│       ├── package.json
│       ├── tsconfig.json
│       ├── nest-cli.json
│       ├── Dockerfile
│       └── .env.example
├── database/
│   └── init.sql                      # Script para inicializar BD
├── docs/
│   └── API.md                        # Documentação detalhada da API
├── docker-compose.yml                # Composição produção
├── docker-compose.dev.yml            # Composição desenvolvimento
├── package.json                      # Root workspace (Yarn)
├── tsconfig.json                     # Root TypeScript config
├── .gitignore                        # Git ignore rules
└── README.md                         # Este arquivo
```

---

## 🔌 API Reference

### Visão Geral dos Endpoints

A API segue o padrão RESTful com todas as rotas sob `/api/v1`.

### ✅ Health Check
```
GET /api/v1/health
```

### 🔐 Autenticação
```
POST /api/v1/auth/login                    # Login (público)
```

### 👥 Usuários (Admin)
```
GET    /api/v1/users                       # Listar usuários (paginado)
GET    /api/v1/users/:id                   # Obter usuário por ID
POST   /api/v1/users                       # Criar novo usuário
PATCH  /api/v1/users/:id                   # Atualizar usuário
PATCH  /api/v1/users/:id/deactivate        # Desativar conta
```

### 📦 Itens (Todos leem, Admin modifica)
```
GET    /api/v1/items                       # Listar itens (paginado, filtros)
GET    /api/v1/items/:id                   # Obter item com variações
POST   /api/v1/items                       # Criar item (Admin)
PATCH  /api/v1/items/:id                   # Atualizar item (Admin)
PATCH  /api/v1/items/:id/deactivate        # Desativar item (Admin)
POST   /api/v1/items/:id/variations        # Adicionar variação (Admin)
```

### 📊 Estoque (Admin)
```
GET    /api/v1/stock                       # Listar estoque (paginado, filtros)
GET    /api/v1/stock/low                   # Itens em baixo estoque
GET    /api/v1/stock/:itemId/:variationId  # Consultar entrada específica
PATCH  /api/v1/stock/:itemId/:variationId/minimum  # Atualizar mínimo
```

### 📥 Remessas (Admin)
```
GET    /api/v1/shipments                   # Listar remessas (paginado, filtros)
GET    /api/v1/shipments/:id               # Obter remessa
POST   /api/v1/shipments                   # Registrar entrada
PATCH  /api/v1/shipments/:id/complete      # Completar remessa
PATCH  /api/v1/shipments/:id/cancel        # Cancelar remessa
```

### 📋 Pedidos (Aluno: seus; Admin: todos)
```
GET    /api/v1/orders                      # Listar pedidos (paginado, filtros)
GET    /api/v1/orders/:id                  # Obter pedido
POST   /api/v1/orders                      # Criar novo pedido (Aluno)
PATCH  /api/v1/orders/:id/review           # Aprovar/rejeitar (Admin)
PATCH  /api/v1/orders/:id/deliver          # Entregar (Admin)
```

### 📝 Movimentações (Admin)
```
GET    /api/v1/movements                   # Auditoria completa (paginado, filtros)
GET    /api/v1/movements/item/:itemId      # Movimentos de item específico
```

### Paginação, Filtros e Sorting

Todos os endpoints de listagem suportam:

**Query Parameters:**
```
?pageIndex=0          # Página (0-based)
?pageSize=25          # Itens por página
?sortOrder=ASC        # Ordem: ASC ou DESC
```

**Filtros Específicos:**

| Endpoint | Filtros |
|----------|---------|
| `/users` | `userType` (admin/student), `isActive` (true/false), `email`, `name` |
| `/items` | `name` (búsqueda), `type`, `isActive` (true/false) |
| `/stock` | `itemId`, `variationId` |
| `/shipments` | `status` (pending/completed/cancelled), `responsibleId` |
| `/orders` | `status` (pending/approved/rejected/delivered), `userId` |
| `/movements` | `itemId`, `variationId`, `movementType` (IN/OUT), `originType` |

**Exemplo:**
```bash
GET /api/v1/items?pageIndex=0&pageSize=50&sortOrder=DESC&isActive=true&type=Equipamento
```

---

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação

1. **Login** - POST `/api/v1/auth/login`
   ```json
   {
     "email": "admin@ifba.edu.br",
     "password": "senha123"
   }
   ```

2. **Recebe JWT Token**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 1,
       "email": "admin@ifba.edu.br",
       "userType": "admin"
     }
   }
   ```

3. **Usar em Requisições**
   ```bash
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### RBAC (Controle de Acesso Baseado em Funções)

O sistema usa **user_type** do JWT como única fonte de verdade:

```
JwtPayload {
  sub: 1,
  email: "admin@ifba.edu.br",
  userType: "admin"  ← RolesGuard lê este campo
}
```

**Roles:**
- `admin` - Acesso total, gestão de estoque e usuários
- `student` - Criar pedidos, visualizar itens e seus próprios pedidos

**Decorador de Roles:**
```typescript
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
someMethod() { ... }
```

---

## 👨‍💻 Desenvolvimento

### Estrutura Modular

A API é organizada em módulos NestJS independentes:

```
src/
├── auth/
│   ├── auth.controller.ts     # Endpoints
│   ├── auth.service.ts        # Lógica de negócio
│   ├── auth.module.ts         # Módulo NestJS
│   ├── jwt.strategy.ts        # Estratégia JWT
│   └── dto/
│       └── login.dto.ts       # DTO de login
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── entities/
│       ├── user.entity.ts
│       ├── student.entity.ts
│       └── administrator.entity.ts
├── common/
│   ├── decorators/            # @CurrentUser, @Roles
│   ├── guards/                # JWT, Roles
│   └── filters/               # Exception filters
└── ...
```

### Padrões de Código

**DTOs (Data Transfer Objects):**
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

**Controllers:**
```typescript
@Controller('users')
export class UsersController {
  @Get()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(@Query() query: UsersListQuery) {
    return this.usersService.findAll(query);
  }
}
```

**Services:**
```typescript
@Injectable()
export class UsersService {
  async findAll(query: UsersListQuery) {
    const { pageIndex = 0, pageSize = 25, sortOrder = 'ASC' } = query;
    
    const [data, total] = await this.usersRepository
      .createQueryBuilder('user')
      .skip(pageIndex * pageSize)
      .take(pageSize)
      .orderBy('user.id', sortOrder)
      .getManyAndCount();

    return { data, total, pageIndex, pageSize };
  }
}
```

### TypeORM Entities

Utilizamos tipos de herança (Inheritance) para usuários:

```typescript
@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'user_type' } })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;
}

@Entity('students')
@ChildEntity()
export class Student extends User {
  @Column()
  registration: string;
}
```

### Rodando Testes

```bash
yarn test                # Executar testes
yarn test --watch       # Modo watch
yarn test --coverage    # Com cobertura
```

---

## 🔨 Build e Produção

### Compilar para Produção

```bash
# Build
yarn build

# Verificar output
ls -la apps/api/dist/
```

### Executar em Produção

```bash
# Depois do build
yarn start

# Ou com Node diretamente
node apps/api/dist/main.js
```

### Docker Build

```bash
# Build da imagem
docker build -t almoxpert-api:latest apps/api/

# Executar container
docker run -p 3000:3000 \
  -e DATABASE_HOST=host.docker.internal \
  -e DATABASE_PASSWORD=sua_senha \
  -e JWT_SECRET=sua_chave_secreta \
  almoxpert-api:latest
```

### Docker Compose - Produção

```bash
# Start
docker-compose up -d

# Logs
docker-compose logs -f api

# Stop
docker-compose down
```

---

## 🌍 Variáveis de Ambiente

### Desenvolvimento (.env)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=almoxpert

# JWT
JWT_SECRET=my-super-secret-key-at-least-32-characters-long
JWT_EXPIRATION=24h

# API
PORT=3000
NODE_ENV=development
```

### Produção (.env.production)

```env
# Database - Use credenciais seguras!
DATABASE_HOST=db.production.internal
DATABASE_PORT=3306
DATABASE_USER=almoxpert_prod
DATABASE_PASSWORD=senha_muito_segura_aqui
DATABASE_NAME=almoxpert_prod

# JWT - Gere uma chave forte!
JWT_SECRET=use_um_gerador_de_chaves_seguras_com_32_caracteres_min
JWT_EXPIRATION=24h

# API
PORT=3000
NODE_ENV=production
```

---

## 🆘 Troubleshooting

### Erro: "Cannot find module '@nestjs/core'"

```bash
# Reinstale dependências
rm -rf node_modules apps/api/node_modules
yarn install
```

### Erro de Conexão com MySQL

```bash
# Verifique se MySQL está rodando
mysql -u root -p -e "SELECT 1"

# Verifique credenciais em .env
cat apps/api/.env

# Se usar Docker
docker-compose ps mysql
```

### Erro: "JWT_SECRET is not defined"

```bash
# Crie o arquivo .env
cp apps/api/.env.example apps/api/.env

# Configure JWT_SECRET
echo "JWT_SECRET=sua_chave_muito_segura_aqui" >> apps/api/.env
```

### Porta 3000 em Uso

```bash
# Encontre o processo
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Ou use porta diferente
PORT=3001 yarn dev
```

### Banco de Dados Corrompido

```bash
# Recrie do zero
docker-compose down -v
docker-compose up -d
mysql -u root -p < database/init.sql
```

### Erro no Build: "TypeScript error"

```bash
# Verifique a sintaxe
yarn build --verbose

# Limpe cache
rm -rf apps/api/dist tsconfig.tsbuildinfo
yarn build
```

---

## 📚 Documentação Adicional

- **[API Reference Completa](./docs/API.md)** - Endpoints e exemplos detalhados
- **[Database Schema](./database/init.sql)** - Estrutura do banco de dados
- **[Swagger/OpenAPI](http://localhost:3000/api/docs)** - Documentação interativa (ao rodar o servidor)

---

## 🤝 Contribuindo

1. **Fork** o repositório
2. Crie uma **branch** para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um **Pull Request**

### Convenções de Código

- Use **TypeScript** estrito
- Siga **NestJS best practices**
- Use **DTOs** para validação
- Adicione **comentários** em lógica complexa
- Escreva **testes unitários**

---

## 📄 Licença

Este projeto é propriedade da IFBA.

---

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Abra uma [Issue](../../issues)
- 💬 Consulte a [Documentação](./docs/API.md)
- 🔍 Verifique [Troubleshooting](#troubleshooting)

---

**Última atualização:** Março de 2026 | **Versão:** 1.0.0
