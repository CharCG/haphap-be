<div align="center">
	<a><img src="https://res.cloudinary.com/dhq272ra1/image/upload/v1778337572/haphap-logo_sipbze.png" alt="" width="35%"></a>
</div>

<div align="center">
	<a><img src="https://img.shields.io/badge/Node.js-16.x-339933?logo=nodedotjs"></a>
	<a><img src="https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs"></a>
	<a><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript"></a>
  <a><img src="https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma"></a>
  <a><img src="https://img.shields.io/badge/PostgreSQL-16.x-4169E1?logo=postgresql"></a>
  <a><img src="https://img.shields.io/badge/Supabase-gray?logo=supabase"></a>
  <a><img src="https://img.shields.io/badge/Midtrans-gray?logo=data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NS40MiA1OS43OTMiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojOWRkY2Y5O30uY2xzLTEsLmNscy0yLC5jbHMtM3tmaWxsLXJ1bGU6ZXZlbm9kZDt9LmNscy0ye2ZpbGw6IzAwYWNkYjt9LmNscy0ze2ZpbGw6IzAyNTZhNzt9PC9zdHlsZT48L2RlZnM+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMy45NTksNDguMjQzQTMuOTU4LDMuOTU4LDAsMCwxLDAsNDQuMjg1di0yOC44YTMuOTU5LDMuOTU5LDAsMSwxLDcuOTE3LDB2MjguOEEzLjk1OCwzLjk1OCwwLDAsMSwzLjk1OSw0OC4yNDNaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNTEuNDYxLDQ4LjI0M0EzLjk1OCwzLjk1OCwwLDAsMSw0Ny41LDQ0LjI4NVYxNS41MDhhMy45NTksMy45NTksMCwxLDEsNy45MTcsMFY0NC4yODVBMy45NTksMy45NTksMCwwLDEsNTEuNDYxLDQ4LjI0M1oiLz48cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Ik0yNy43MSw1OS43OTNhMy45NiwzLjk2LDAsMCwxLTMuOTU5LTMuOTU5VjMuOTU5YTMuOTU5LDMuOTU5LDAsMSwxLDcuOTE3LDBWNTUuODM0QTMuOTU5LDMuOTU5LDAsMCwxLDI3LjcxLDU5Ljc5M1oiLz48L3N2Zz4="></a>
</div>

## Description

[HapHap]() is a dual-sided surplus food marketplace that connects customers with local merchants to rescue the day's high-quality unsold meals at discounted prices — reducing waste while saving money. By actively reducing food waste, the platform directly supports [SDG 12](https://sdgs.un.org/goals/goal12) (Responsible Consumption and Production).

## Documentation

- [Features](#features)
- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Endpoints](#endpoints)
- [Architecture](#architecture)

## Features

- Authentication & Authorization: JWT-based auth with three roles (Customer, Merchant, Admin). Users can toggle between Customer and Merchant mode.
- Merchant Registration: Customers submit an application for Admin review. On approval, a Merchant is automatically created.
- Menu Management: Merchants manage a master menu with soft-delete support.
- Surplus Listings: Merchants create daily surplus listings from their master menu with custom stock and discount price.
- Auto-Disable: Unsold surplus items are automatically disabled at the merchant's closing time.
- Checkout & Pickup: Customers checkout via a per-merchant cart. On payment, a QR code is issued for onsite pickup.
- Order Completion: Merchants scan the customer's QR code to mark an order as completed.
- Reviews & Reputation: Customers leave one review per completed order.
- Gamification: Customers track cumulative Rp saved and total food portions rescued across all orders.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en) (v16 or higher)
- [npm](https://www.npmjs.com) or [yarn](https://yarnpkg.com) or [pnpm](https://pnpm.io/id)
- [PostgreSQL](https://www.postgresql.org) (v16 or higher)

### Installation

```bash
git clone https://github.com/your-org/haphap-backend.git
cd haphap-backend

npm install

cp .env.example .env

npx prisma generate
npx prisma migrate dev
```

### Environment Variables

```
PORT=
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
```

### Running

```
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Endpoints

Base URL: `/api`

All endpoints return responses using the following standardized format:

```json
{
	"success": true,
	"statusCode": 200,
	"message": "...",
	"data": { ... }
}
```

### Auth (`/auth`)

| Method | Endpoint         | Access | Description |
| ------ | ---------------- | ------ | ----------- |
| `POST` | `/auth/register` | PUBLIC | \*          |
| `POST` | `/auth/login`    | PUBLIC | \*          |

### Users (`/users`)

| Method  | Endpoint             | Access             | Description |
| ------- | -------------------- | ------------------ | ----------- |
| `GET`   | `/users/me`          | CUSTOMER, MERCHANT | \*          |
| `PATCH` | `/users/me`          | CUSTOMER, MERCHANT | \*          |
| `PATCH` | `/users/me/password` | CUSTOMER, MERCHANT | \*          |

### Applications (`/applications`)

| Method  | Endpoint                       | Access   | Description |
| ------- | ------------------------------ | -------- | ----------- |
| `GET`   | `/applications`                | ADMIN    | \*          |
| `GET`   | `/applications/me`             | CUSTOMER | \*          |
| `POST`  | `/applications`                | CUSTOMER | \*          |
| `PATCH` | `/applications/:applicationId` | ADMIN    | \*          |

### Merchants (`/merchants`)

| Method  | Endpoint                 | Access   | Description |
| ------- | ------------------------ | -------- | ----------- |
| `GET`   | `/merchants`             | PUBLIC   | \*          |
| `GET`   | `/merchants/:merchantId` | PUBLIC   | \*          |
| `GET`   | `/merchants/me`          | MERCHANT | \*          |
| `PATCH` | `/merchants/me`          | MERCHANT | \*          |

### Menus (`/menus`)

| Method   | Endpoint             | Access   | Description |
| -------- | -------------------- | -------- | ----------- |
| `GET`    | `/menus`             | MERCHANT | \*          |
| `POST`   | `/menus`             | MERCHANT | \*          |
| `PATCH`  | `/menus/:menuItemId` | MERCHANT | \*          |
| `DELETE` | `/menus/:menuItemId` | MERCHANT | \*          |

### Surplus (`/surplus`)

| Method  | Endpoint                  | Access   | Description |
| ------- | ------------------------- | -------- | ----------- |
| `GET`   | `/surplus`                | MERCHANT | \*          |
| `POST`  | `/surplus`                | MERCHANT | \*          |
| `PATCH` | `/surplus/:surplusItemId` | MERCHANT | \*          |

### Orders (`/orders`)

| Method  | Endpoint           | Access             | Description |
| ------- | ------------------ | ------------------ | ----------- |
| `POST`  | `/orders`          | CUSTOMER           | \*          |
| `GET`   | `/orders/:orderId` | CUSTOMER, MERCHANT | \*          |
| `GET`   | `/orders/me`       | CUSTOMER           | \*          |
| `GET`   | `/orders/merchant` | MERCHANT           | \*          |
| `PATCH` | `/orders/scan`     | MERCHANT           | \*          |

### Reviews (`/reviews`)

| Method | Endpoint                         | Access   | Description |
| ------ | -------------------------------- | -------- | ----------- |
| `POST` | `/reviews`                       | CUSTOMER | \*          |
| `GET`  | `/merchants/:merchantId/reviews` | PUBLIC   | \*          |

## Architecture

<img src="https://res.cloudinary.com/dhq272ra1/image/upload/v1778335168/Context_hs21ti.png">
