# Stage Platform

A full-stack crowdfunding and peer-to-peer investment platform. Users can discover projects, invest in funding pools, manage portfolios, trade on a secondary market, and handle insurance claims -- all with role-based access control.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Roles and Permissions](#roles-and-permissions)
- [Business Workflows](#business-workflows)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Features

| Domain | Description |
|--------|-------------|
| **Authentication** | Registration, JWT login/logout, password reset |
| **KYC Verification** | ID document submission, insurer/admin review, status notifications |
| **Projects** | Create, edit, submit for review, admin approval/rejection |
| **Funding Pools** | Pool creation per published project, real-time funding progress tracking |
| **Investments** | Atomic investment creation for KYC-approved investors with pool limits |
| **Payments** | Payment processing with automatic transaction and notification generation |
| **Transactions** | Full financial ledger (investment, refund, withdrawal, deposit) |
| **Secondary Market** | List, buy, and cancel confirmed investments with ownership transfer |
| **Notifications** | Event-driven notifications across 6 categories |
| **Risk Management** | Rule-based project risk scoring (0-100) from 6 weighted factors |
| **Claims** | Investor claim submission with internal notes and review workflow |
| **Insurance** | Coverage rules, report generation, dedicated insurer dashboard |
| **Administration** | Full CRUD dashboard with stats across all entities |

---

## Tech Stack

### Backend (`/backend`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| Django | 6.1 | Web framework |
| Django REST Framework | 3.18 | REST API toolkit |
| Simple JWT | 5.5 | JWT authentication (30min access, 1 day refresh) |
| drf-spectacular | 0.30 | OpenAPI/Swagger documentation |
| django-cors-headers | 4.9 | CORS management |
| psycopg2-binary | 2.9 | PostgreSQL driver (production) |
| python-dotenv | 1.2 | Environment variable loading |
| Ruff | — | Linter (pyproject.toml configured) |

### Frontend (`/frontend`)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | UI framework |
| TypeScript | 6.0 | Static typing |
| Vite | 8.2 | Bundler and dev server |
| Tailwind CSS | 4.3 | Utility-first CSS |
| React Router | 7.18 | Client-side routing |
| TanStack Query | 5.102 | Server state management and caching |
| Zustand | 5.0 | Client state (auth, theme) |
| React Hook Form + Zod | 7.87 / 3.25 | Form management and validation |
| Axios | 1.20 | HTTP client with JWT interceptor |
| Recharts | 3.10 | Charts and data visualization |
| i18next | 26.4 | Internationalization (French) |
| Vitest | 4.1 | Unit testing |
| Playwright | 1.62 | End-to-end testing |
| Oxlint | 1.79 | Linting |

### API Service (`/api-service`)

| Technology | Purpose |
|------------|---------|
| FastAPI | Auxiliary async service (health check, extensible) |

### Database

| Environment | Engine |
|-------------|--------|
| Development | SQLite (`db.sqlite3`) |
| Production | PostgreSQL |

---

## Architecture

```
stage-platform/
├── backend/                    # Django REST API
│   ├── config/                 #   Settings, root URL routing, WSGI/ASGI
│   ├── users/                  #   Authentication, KYC, user management
│   ├── projects/               #   Investment projects (lifecycle: DRAFT → PUBLISHED)
│   ├── pools/                  #   Funding pools (OneToOne with Project)
│   ├── investments/            #   Investor commitments (atomic pool updates)
│   ├── payments/               #   Payment processing (triggers Transaction + Notification)
│   ├── transactions/           #   Financial transaction ledger (read-only)
│   ├── secondary_market/       #   Investment resale marketplace (atomic buy)
│   ├── notifications/          #   Event-driven notification system (6 types)
│   ├── risk_management/        #   Rule-based project risk scoring
│   ├── claims/                 #   Claim submission and review workflow
│   ├── insurer/                #   Coverage rules, reports, insurer dashboard
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── api/                #   Axios instance + 14 domain API services
│   │   ├── components/         #   Reusable UI components (common/, layout/)
│   │   ├── hooks/              #   TanStack Query hooks (1 per domain)
│   │   ├── pages/              #   Page components (16 domains, 55+ pages)
│   │   ├── routes/             #   Route guards (Protected, Admin, Insurer)
│   │   ├── store/              #   Zustand stores (auth, theme)
│   │   ├── types/              #   Shared TypeScript types
│   │   ├── styles/             #   CSS design system with dark mode
│   │   ├── i18n/               #   French translations
│   │   └── utils/              #   Utility functions
│   ├── e2e/                    #   Playwright E2E specs
│   ├── package.json
│   └── .env.example
├── api-service/                # FastAPI auxiliary service
│   └── app/
│       ├── main.py
│       ├── schemas.py
│       └── services.py
└── README.md
```

### Backend Layer Pattern

Each Django app follows a consistent layered architecture:

```
Model → Serializer → Service → View → URL
```

- **Models**: Data schema, constraints, relationships
- **Serializers**: Validation, serialization/deserialization
- **Services**: Business logic (atomic operations, side effects)
- **Views**: HTTP request/response handling (APIViews)
- **URLs**: Endpoint routing

### Frontend Data Flow

```
Page → Hook (useQuery/useMutation) → API Service (axios) → Backend REST
                ↓
        Zustand Store (auth state)
                ↓
        React Component (UI)
```

### Key Architectural Patterns

| Pattern | Implementation |
|---------|----------------|
| **Atomic Financial Operations** | `select_for_update()` in Investment and Secondary Market services |
| **Event-Driven Side Effects** | Payment confirmation creates Transaction + Notification + updates Pool |
| **Role-Based Access Control** | 6 custom DRF permission classes + 3 frontend route guards |
| **JWT Token Refresh Queue** | Axios interceptor queues concurrent requests during token refresh |
| **Code Splitting** | All 55+ page components use `React.lazy()` for lazy loading |
| **Dual Styling System** | Tailwind CSS utilities + custom CSS design system with light/dark modes |

---

## Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the Repository

```bash
git clone <repo-url>
cd stage-platform
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env         # Windows
# cp .env.example .env         # Linux/Mac
# Edit .env with your values

# Apply database migrations
python manage.py migrate

# Create a superuser account
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

Backend available at `http://127.0.0.1:8000`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
copy .env.example .env         # Windows
# cp .env.example .env         # Linux/Mac

# Start the development server
npm run dev
```

Frontend available at `http://localhost:5173`.

In development, Vite proxies `/api` requests to `http://127.0.0.1:8000` automatically.

### 4. Useful Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Production build (TypeScript + Vite) |
| `npm run lint` | Lint frontend with oxlint |
| `npm run test` | Unit tests (vitest) |
| `npm run test:e2e` | E2E tests (playwright) |
| `python manage.py test` | Django tests |
| `python manage.py shell` | Django shell |

---

## Environment Configuration

Each component has its own `.env.example` file. Copy it to `.env` and fill in values.

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key for cryptographic signing | `django-insecure-dev-key-change-in-production` |
| `DEBUG` | Enable debug mode (disable in production) | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hostnames | `localhost,127.0.0.1` |
| `DB_ENGINE` | Database engine (`sqlite3` or `postgresql`) | `sqlite3` |
| `DB_NAME` | PostgreSQL database name | `stage_platform` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | — |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend URLs | `http://localhost:5173,...` |
| `CORS_ALLOW_ALL_ORIGINS` | Allow all CORS origins (never use in production) | `False` |
| `FRONTEND_URL` | Frontend base URL (for password reset links) | `http://localhost:5173` |
| `EMAIL_BACKEND` | Email backend (`console` or `smtp`) | `console` |
| `EMAIL_HOST` | SMTP server host | `smtp.example.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USE_TLS` | Use TLS for email | `True` |
| `EMAIL_HOST_USER` | SMTP username | — |
| `EMAIL_HOST_PASSWORD` | SMTP password | — |
| `DEFAULT_FROM_EMAIL` | Sender email address | — |
| `ENABLE_SSL_REDIRECT` | Force HTTPS redirect in production | `False` |

Generate a production secret key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` (proxied in dev) |

Mode-specific files:
- `.env.development` — used during `npm run dev`
- `.env.production` — used during `npm run build`

---

## API Documentation

### Interactive Documentation

| Endpoint | Description |
|----------|-------------|
| `/api/docs/` | Swagger UI (interactive API explorer) |
| `/api/redoc/` | ReDoc (alternative documentation) |
| `/api/schema/` | OpenAPI schema (JSON) |

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/token/` | Obtain JWT access + refresh tokens |
| `POST` | `/api/auth/token/refresh/` | Refresh access token |
| `POST` | `/api/users/register/` | Register new user (INVESTOR or PROJECT_OWNER) |
| `POST` | `/api/users/logout/` | Blacklist refresh token |

### Core Endpoints

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| `GET` | `/api/projects/` | Public | List published projects |
| `POST` | `/api/projects/` | PROJECT_OWNER | Create project |
| `GET` | `/api/projects/<id>/` | Auth | Project detail |
| `POST` | `/api/projects/<id>/submit/` | OWNER | Submit for review |
| `POST` | `/api/projects/<id>/approve/` | ADMIN | Approve project |
| `POST` | `/api/projects/<id>/reject/` | ADMIN | Reject project |
| `GET` | `/api/pools/` | Public | List open pools |
| `POST` | `/api/pools/create/` | PROJECT_OWNER | Create pool |
| `POST` | `/api/investments/` | INVESTOR (KYC OK) | Create investment |
| `GET` | `/api/investments/mine/` | Auth | List own investments |
| `POST` | `/api/payments/` | Auth | Create payment |
| `POST` | `/api/payments/<id>/confirm/` | Auth | Confirm payment |
| `GET` | `/api/transactions/mine/` | Auth | List own transactions |
| `POST` | `/api/secondary-market/` | Auth | Create listing |
| `POST` | `/api/secondary-market/<id>/buy/` | INVESTOR | Buy listing |
| `GET` | `/api/notifications/` | Auth | List notifications |
| `POST` | `/api/notifications/<id>/read/` | Auth | Mark as read |
| `POST` | `/api/notifications/read-all/` | Auth | Mark all as read |
| `GET` | `/api/claims/` | Auth | List claims |
| `POST` | `/api/claims/` | Auth | Submit claim |
| `POST` | `/api/claims/<pk>/review/` | INSURER/ADMIN | Review claim |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/admin/stats/` | Global platform statistics |
| `GET` | `/api/users/admin/users/` | List all users |
| `GET/PATCH/DELETE` | `/api/users/admin/users/<id>/` | User CRUD |
| `GET` | `/api/projects/admin/pending/` | Pending projects |
| `GET` | `/api/investments/admin/investments/` | All investments |
| `GET` | `/api/payments/admin/payments/` | All payments |
| `GET` | `/api/transactions/admin/transactions/` | All transactions |
| `GET` | `/api/secondary-market/admin/listings/` | All listings |
| `GET` | `/api/notifications/admin/notifications/` | All notifications |

For the complete API reference with request/response schemas, see [`BACKEND_API_DOCS.md`](./BACKEND_API_DOCS.md).

---

## Roles and Permissions

| Role | Description | Capabilities |
|------|-------------|--------------|
| `INVESTOR` | Investor | Invest, pay, trade on secondary market, submit claims |
| `PROJECT_OWNER` | Project owner | Create/edit projects, create pools, track investments |
| `INSURER` | Insurer | Review KYC, manage coverage rules, handle claims, generate reports |
| `ADMIN` | Administrator | Full CRUD access to all entities |

Only `INVESTOR` and `PROJECT_OWNER` roles are available at registration. `INSURER` and `ADMIN` accounts are created via Django shell or admin panel.

---

## Business Workflows

### Project Lifecycle

```
DRAFT → PENDING (submit) → PUBLISHED (admin approves)
                         → REJECTED (admin rejects)
                              → DRAFT (editable, resubmittable)
```

### Investment Flow

```
1. Investor creates investment (PENDING)
2. Investor creates payment for the investment
3. Investor confirms payment → SUCCESS
   → Investment becomes CONFIRMED
   → Transaction (INVESTMENT) created
   → Notification sent
   → Pool collected_amount updated
   → If target reached → Pool becomes FUNDED
```

### Pool Lifecycle

```
OPEN → FUNDED (target amount reached)
OPEN → CLOSED (end date passed)
OPEN → CANCELLED (cancelled by owner)
```

### Secondary Market

```
1. Seller lists a CONFIRMED investment → ACTIVE
2. Buyer purchases → Atomic ownership transfer
   → Listing becomes SOLD
   → Transaction (INVESTMENT) created
   → Notifications for both parties
3. Or → CANCELLED (seller cancels)
```

### Claims Workflow

```
SUBMITTED → UNDER_REVIEW → APPROVED → PAID → CLOSED
                        → REJECTED
```

---

## Testing

### Backend

```bash
cd backend

# Run all tests
python manage.py test

# Run tests for a specific module
python manage.py test users
python manage.py test investments
python manage.py test payments

# With coverage
pip install coverage
coverage run manage.py test
coverage report
```

### Frontend

```bash
cd frontend

# Unit tests
npm run test           # Single run
npm run test:watch     # Watch mode

# E2E tests
npm run test:e2e:install   # Install browsers (first time)
npm run test:e2e           # Run E2E tests
npm run test:e2e:headed    # Run with visible browser

# Linting
npm run lint
```

---

## Deployment

### Production Checklist

```bash
# Backend
DEBUG=False
SECRET_KEY=<unique-secret-key>
DB_ENGINE=postgresql
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<database-password>
ALLOWED_HOSTS=<your-domain.com>
CORS_ALLOWED_ORIGINS=https://<your-domain.com>
ENABLE_SSL_REDIRECT=True
```

### Recommended Stack

- **Web Server**: Nginx (reverse proxy) + Gunicorn (WSGI)
- **Database**: PostgreSQL
- **Cache**: Redis (optional)
- **SSL**: Let's Encrypt or cloud provider

```bash
# Backend production setup
pip install gunicorn
gunicorn config.wsgi:application --workers 4

# Collect static files
python manage.py collectstatic --noinput

# Apply migrations
python manage.py migrate
```

---

## License

Private project - All rights reserved.
