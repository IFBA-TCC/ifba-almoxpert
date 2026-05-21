# AlmoxPert — API Reference

Monorepo: `apps/api` — single NestJS API, all routes under `/api/v1`.

## Authentication

All routes except `POST /api/v1/auth/login` require a **Bearer token**.

```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Auth
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/auth/login` | Public | Returns JWT token |

### Users
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/users` | Admin | List all users |
| GET | `/users/:id` | Admin | Get user by ID |
| POST | `/users` | Admin | Create student or admin |
| PATCH | `/users/:id` | Admin | Update user |
| PATCH | `/users/:id/deactivate` | Admin | Deactivate account |

### Items
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/items` | Any | List active items with variations |
| GET | `/items/:id` | Any | Get single item |
| POST | `/items` | Admin | Create item |
| PATCH | `/items/:id` | Admin | Update item |
| PATCH | `/items/:id/deactivate` | Admin | Deactivate item |
| POST | `/items/:id/variations` | Admin | Add variation to item |

### Stock
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/stock` | Admin | Full stock list |
| GET | `/stock/low` | Admin | Items at or below minimum |
| GET | `/stock/:itemId/:variationId` | Admin | Single stock entry |
| PATCH | `/stock/:itemId/:variationId/minimum` | Admin | Update minimum threshold |

### Shipments (stock entries — items coming IN)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/shipments` | Admin | List all shipments |
| GET | `/shipments/:id` | Admin | Get shipment |
| POST | `/shipments` | Admin | Register new stock entry |
| PATCH | `/shipments/:id/complete` | Admin | Complete shipment |
| PATCH | `/shipments/:id/cancel` | Admin | Cancel shipment |

### Orders (student requests — items going OUT)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/orders` | Admin (all) / Student (own) | List orders |
| GET | `/orders/:id` | Admin (any) / Student (own) | Get order |
| POST | `/orders` | Student | Place a new request |
| PATCH | `/orders/:id/review` | Admin | Approve or reject |
| PATCH | `/orders/:id/deliver` | Admin | Mark as delivered + deduct stock |

### Movements (audit log)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/movements` | Admin | Full movement history |
| GET | `/movements/item/:itemId` | Admin | Movements for a specific item |

---

## RBAC

Authorization is derived exclusively from `user_type` in the JWT payload —
**no separate roles table**. The `users.user_type` ENUM (`'admin' | 'student'`)
is the single source of truth.

```
JwtPayload { sub, email, userType }
                              ↑
                     RolesGuard reads this
```

---

## Running locally

```bash
# 1. Install dependencies
yarn install

# 2. Setup database
mysql -u root -p < init.sql

# 3. Configure environment
cp apps/api/.env.example apps/api/.env
# edit .env with your DB credentials and a strong JWT_SECRET

# 4. Start in dev mode (with watch)
yarn dev
```
