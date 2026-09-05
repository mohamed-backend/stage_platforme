# Backend - Django REST API

REST API for the Stage Platform crowdfunding application, built with Django 6.1 and Django REST Framework.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Data Models](#data-models)
- [Authentication and Authorization](#authentication-and-authorization)
- [Modules](#modules)
- [Business Workflows](#business-workflows)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Django | 6.1 | Web framework |
| Django REST Framework | 3.18 | REST API toolkit |
| Simple JWT | 5.5 | JWT authentication (30min access, 1 day refresh) |
| drf-spectacular | 0.30 | OpenAPI/Swagger documentation |
| django-cors-headers | 4.9 | CORS management |
| psycopg2-binary | 2.9 | PostgreSQL driver |
| python-dotenv | 1.2 | Environment variable loading |
| SQLite / PostgreSQL | — | Database |

---

## Project Structure

```
backend/
├── config/                     # Django project configuration
│   ├── settings.py             #   Main settings (JWT, CORS, DB, security)
│   ├── urls.py                 #   Root URL router (wires all 11 apps)
│   ├── asgi.py
│   └── wsgi.py
├── users/                      # User management & KYC
│   ├── models.py               #   User (AbstractUser) + KYCVerification
│   ├── views.py                #   Register, Me, Logout, KYC, PasswordReset, PublicStats
│   ├── serializers.py          #   RegisterSerializer, UserSerializer, KYCSerializer
│   ├── permissions.py          #   IsInvestor, IsProjectOwner, IsInsurer, IsAdmin, IsOwnerOrAdmin
│   ├── services.py             #   UserService, KYCService
│   ├── backends.py             #   EmailOrUsernameModelBackend
│   ├── admin_views.py          #   AdminStats, AdminUserList, AdminUserDetail
│   ├── admin_urls.py
│   ├── insurer_views.py        #   InsurerStats, InsurerPendingKYC
│   └── migrations/
├── projects/                   # Investment projects
│   ├── models.py               #   Project (DRAFT→PENDING→PUBLISHED/REJECTED/CLOSED)
│   ├── views.py                #   CRUD + submit/approve/reject
│   ├── serializers.py
│   ├── services.py             #   ProjectService
│   ├── admin_views.py
│   ├── admin_urls.py
│   └── migrations/
├── pools/                      # Funding pools
│   ├── models.py               #   Pool (OneToOne→Project, OPEN/FUNDED/CLOSED/CANCELLED)
│   ├── views.py                #   List, Detail, Create, MyPools
│   ├── serializers.py
│   ├── services.py             #   PoolService
│   └── migrations/
├── investments/                # Investor commitments
│   ├── models.py               #   Investment (PENDING→CONFIRMED/CANCELLED/REFUNDED)
│   ├── views.py                #   Create, List, Detail, OwnerList
│   ├── serializers.py
│   ├── services.py             #   InvestmentService (atomic with select_for_update)
│   ├── admin_views.py
│   ├── admin_urls.py
│   └── migrations/
├── payments/                   # Payment processing
│   ├── models.py               #   Payment (PENDING→SUCCESS/FAILED/REFUNDED)
│   ├── views.py                #   Create, List, Detail, Confirm
│   ├── serializers.py
│   ├── services.py             #   PaymentService (confirm creates Transaction + Notification)
│   ├── admin_views.py
│   ├── admin_urls.py
│   └── migrations/
├── transactions/               # Financial transaction ledger
│   ├── models.py               #   Transaction (INVESTMENT/REFUND/WITHDRAWAL/DEPOSIT)
│   ├── views.py                #   List, Detail (read-only)
│   ├── serializers.py
│   ├── admin_views.py
│   ├── admin_urls.py
│   └── migrations/
├── secondary_market/           # Investment resale marketplace
│   ├── models.py               #   Listing (ACTIVE→SOLD/CANCELLED)
│   ├── views.py                #   Create, List, MyListings, Cancel, Buy
│   ├── serializers.py
│   ├── services.py             #   ListingService (atomic buy with ownership transfer)
│   ├── admin_views.py
│   ├── admin_urls.py
│   └── migrations/
├── notifications/              # Notification system
│   ├── models.py               #   Notification (6 types: INVESTMENT/PAYMENT/TRANSACTION/MARKET/PROJECT/SYSTEM)
│   ├── views.py                #   List, MarkRead, MarkAllRead
│   ├── serializers.py
│   ├── admin_views.py
│   ├── admin_urls.py
│   └── migrations/
├── risk_management/            # Risk assessment
│   ├── models.py               #   RiskAssessment (score 0-100, 6 weighted factors)
│   ├── views.py                #   List, Detail, Calculate, CalculateAll, CalculatePending
│   ├── serializers.py
│   └── migrations/
├── claims/                     # Investor claims
│   ├── models.py               #   Claim (6 statuses), ClaimNote
│   ├── views.py                #   List/Create, Detail/Delete, Review, Notes
│   ├── serializers.py
│   ├── permissions.py
│   ├── services.py
│   ├── admin_views.py
│   ├── admin_urls.py
│   └── migrations/
├── insurer/                    # Insurer module
│   ├── models.py               #   CoverageRule, InsurerReport
│   ├── views.py                #   CoverageRule CRUD, Report generation
│   ├── serializers.py
│   └── migrations/
├── manage.py
├── requirements.txt
├── pyproject.toml              # Ruff linter configuration
├── .env.example
└── db.sqlite3                  # SQLite database (development only)
```

---

## Setup

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
copy .env.example .env    # Windows
cp .env.example .env      # Linux/Mac
```

See `.env.example` for detailed documentation of each variable.

### Database

**Development** (SQLite - zero configuration):

```bash
python manage.py migrate
```

**Production** (PostgreSQL):

```bash
# Set in .env:
DB_ENGINE=postgresql
DB_NAME=stage_platform
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### Common Commands

```bash
python manage.py runserver              # Start dev server
python manage.py migrate               # Apply migrations
python manage.py makemigrations        # Generate migrations
python manage.py createsuperuser       # Create admin user
python manage.py collectstatic         # Collect static files
python manage.py test                  # Run tests
python manage.py shell                 # Django shell
```

---

## Data Models

### User

| Field | Type | Description |
|-------|------|-------------|
| `role` | CharField | `INVESTOR` / `PROJECT_OWNER` / `INSURER` / `ADMIN` |
| `phone` | CharField | Phone number (optional) |
| `is_verified` | BooleanField | Account verified flag |
| `kyc_status` | Property | Computed KYC status (NOT_SUBMITTED / PENDING / APPROVED / REJECTED) |

### KYCVerification

| Field | Type | Description |
|-------|------|-------------|
| `user` | OneToOne → User | Linked user |
| `id_document` | FileField | Identity document upload |
| `status` | CharField | PENDING / UNDER_REVIEW / APPROVED / REJECTED |
| `rejection_reason` | TextField | Rejection reason (optional) |
| `submitted_at` | DateTime | Submission timestamp |
| `reviewed_at` | DateTime | Review timestamp (optional) |
| `reviewed_by` | FK → User | Reviewer (optional) |

### Project

| Field | Type | Description |
|-------|------|-------------|
| `owner` | FK → User | Project owner (PROJECT_OWNER role) |
| `title` | CharField | Project title |
| `description` | TextField | Project description |
| `risk_type` | CharField | Risk category |
| `category` | CharField | Sector (tech, startup, crypto, etc.) |
| `image` | URLField | Project image URL |
| `target_amount` | Decimal | Funding target |
| `duration_months` | PositiveInt | Duration in months |
| `risk_level` | CharField | LOW / MEDIUM / HIGH |
| `expected_return` | Decimal | Expected annual return (%) |
| `status` | CharField | DRAFT / PENDING / PUBLISHED / REJECTED / CLOSED |
| `created_at` / `updated_at` | DateTime | Timestamps |

### Pool

| Field | Type | Description |
|-------|------|-------------|
| `project` | OneToOne → Project | Linked project |
| `target_amount` | Decimal | Funding target |
| `collected_amount` | Decimal | Amount collected so far |
| `minimum_investment` | Decimal | Minimum investment amount |
| `start_date` / `end_date` | DateTime | Pool active period |
| `status` | CharField | OPEN / FUNDED / CLOSED / CANCELLED |

Computed properties: `remaining_amount`, `funding_percentage`

### Investment

| Field | Type | Description |
|-------|------|-------------|
| `investor` | FK → User | Investor |
| `pool` | FK → Pool | Target pool |
| `amount` | Decimal | Investment amount |
| `status` | CharField | PENDING / CONFIRMED / CANCELLED / REFUNDED |
| `confirmed_at` | DateTime | Confirmation timestamp |

### Payment

| Field | Type | Description |
|-------|------|-------------|
| `investment` | OneToOne → Investment | Linked investment |
| `user` | FK → User | Payer |
| `amount` | Decimal | Payment amount |
| `method` | CharField | CARD / BANK_TRANSFER / WALLET |
| `status` | CharField | PENDING / SUCCESS / FAILED / REFUNDED |
| `reference` | CharField | Unique reference (PAY-XXXXXXXXXXXX) |

### Transaction

| Field | Type | Description |
|-------|------|-------------|
| `user` | FK → User | User |
| `investment` | FK → Investment | Linked investment (optional) |
| `transaction_type` | CharField | INVESTMENT / REFUND / WITHDRAWAL / DEPOSIT |
| `amount` | Decimal | Amount |
| `status` | CharField | PENDING / COMPLETED / FAILED / CANCELLED |
| `reference` | CharField | Unique reference (TXN-XXXXXXXXXXXX) |

### Listing (Secondary Market)

| Field | Type | Description |
|-------|------|-------------|
| `seller` | FK → User | Seller |
| `investment` | OneToOne → Investment | Investment being sold |
| `price` | Decimal | Listing price |
| `status` | CharField | ACTIVE / SOLD / CANCELLED |

### Notification

| Field | Type | Description |
|-------|------|-------------|
| `user` | FK → User | Recipient |
| `notification_type` | CharField | INVESTMENT / PAYMENT / TRANSACTION / MARKET / PROJECT / SYSTEM |
| `title` | CharField | Notification title |
| `message` | TextField | Notification body |
| `is_read` | BooleanField | Read status |

### RiskAssessment

| Field | Type | Description |
|-------|------|-------------|
| `project` | OneToOne → Project | Assessed project |
| `score` | Float | Risk score 0-100 |
| `level` | CharField | LOW / MEDIUM / HIGH |
| `factors` | JSONField | Factor breakdown and weights |
| `assessed_at` | DateTime | Assessment timestamp |

### Claim / ClaimNote

| Field | Type | Description |
|-------|------|-------------|
| `claimant` | FK → User | Claim submitter |
| `investment` | FK → Investment | Related investment (optional) |
| `claim_type` | CharField | PROJECT_FAILURE / PAYMENT_ISSUE / PLATFORM_ISSUE / OTHER |
| `title` / `description` | CharField / TextField | Claim details |
| `amount_claimed` | Decimal | Claimed amount (optional) |
| `status` | CharField | SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED → PAID → CLOSED |
| `priority` | CharField | LOW / MEDIUM / HIGH |
| `assigned_to` | FK → User | Assigned insurer/admin |
| `resolution_note` | TextField | Resolution details |
| `ClaimNote` | FK → Claim | Discussion notes (with `is_internal` flag) |

### CoverageRule / InsurerReport

| Field | Type | Description |
|-------|------|-------------|
| `name` / `description` | CharField / TextField | Rule details |
| `max_coverage` | Decimal | Maximum coverage amount |
| `premium_rate` | Decimal | Premium rate (%) |
| `risk_levels` | JSONField | Covered risk levels |
| `is_active` | BooleanField | Rule active status |

---

## Authentication and Authorization

### JWT Configuration

- **Access Token**: 30 minutes
- **Refresh Token**: 1 day (rotated on use, blacklisted after rotation)
- **Header**: `Authorization: Bearer <access_token>`

### Permission Classes

| Class | Condition |
|-------|-----------|
| `IsInvestor` | `role == 'INVESTOR'` |
| `IsProjectOwner` | `role == 'PROJECT_OWNER'` |
| `IsInsurer` | `role == 'INSURER'` |
| `IsAdmin` | `role == 'ADMIN'` |
| `IsOwnerOrAdmin` | `obj.user == user` or `role == 'ADMIN'` |
| `IsProjectOwnerOrAdmin` | `obj.owner == user` or `obj.project.owner == user` or `role == 'ADMIN'` |

### Registration

Only `INVESTOR` and `PROJECT_OWNER` roles are available at registration. `INSURER` and `ADMIN` accounts must be created via Django shell or admin panel.

---

## Modules

### Users

Handles authentication, registration, profile management, KYC verification, and password reset.

- **Registration**: Creates user (INVESTOR or PROJECT_OWNER)
- **Profile (Me)**: Get/update current user profile
- **Logout**: Blacklists refresh token server-side
- **KYC**: Submit identity document, review by INSURER/ADMIN
- **Password Reset**: Email-based reset with frontend link
- **Public Stats**: Non-sensitive statistics for landing page

### Projects

Manages the investment project lifecycle.

- Lifecycle: `DRAFT → PENDING → PUBLISHED / REJECTED`
- Only PROJECT_OWNER can create and edit
- Submission for review triggers notification
- Only ADMIN can approve or reject
- Editable only in DRAFT or REJECTED status

### Pools

Funding pools linked to published projects (OneToOne relationship).

- One pool per published project
- Creation restricted to PROJECT_OWNER for their own published projects
- Auto-status tracking: OPEN → FUNDED (target reached) or CLOSED (end date passed)
- Tracks `collected_amount` and `remaining_amount`

### Investments

Investor commitments to funding pools.

- KYC approval required before creation
- Uses `select_for_update()` to prevent race conditions
- Atomic update of pool `collected_amount`
- Notification sent on creation

### Payments

Payment processing linked to investments.

- Creates payment for PENDING investment
- Confirmation automatically generates: Transaction + Notification + Investment CONFIRMED
- Unique reference: `PAY-XXXXXXXXXXXX`

### Transactions

Financial transaction ledger (read-only for users).

- Types: INVESTMENT, REFUND, WITHDRAWAL, DEPOSIT
- Auto-generated on payment confirmation
- Unique reference: `TXN-XXXXXXXXXXXX`

### Secondary Market

Investment resale marketplace.

- List CONFIRMED investments for sale
- Atomic buy with ownership transfer (`select_for_update`)
- Seller can cancel listings
- Notifications for both buyer and seller

### Notifications

Event-driven notification system.

- 6 types: INVESTMENT, PAYMENT, TRANSACTION, MARKET, PROJECT, SYSTEM
- Individual or bulk mark-as-read

### Risk Management

Rule-based project risk assessment.

- Score based on 6 factors: base risk, target amount, duration, expected return, category, owner experience
- Score 0-100, mapped to LOW/MEDIUM/HIGH
- Manual, bulk, or per-project calculation

### Claims

Investor claim submission and review workflow.

- Submit with type, description, optional amount
- Review by INSURER/ADMIN with status changes
- Internal notes (visible only to staff) and public notes
- Workflow: SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED → PAID → CLOSED

### Insurer

Dedicated module for insurance operations.

- Dashboard with KYC and project statistics
- Pending KYC queue for review
- Coverage rules CRUD
- Report generation

---

## Business Workflows

### Complete Investment Flow

```
1. Investor creates investment → PENDING
2. Investor creates payment for the investment
3. Investor confirms payment → SUCCESS
   → Investment becomes CONFIRMED
   → Transaction (INVESTMENT) created
   → Notification sent
   → Pool collected_amount updated
   → If target reached → Pool becomes FUNDED
```

### Secondary Market Purchase

```
1. Seller lists CONFIRMED investment → ACTIVE
2. Buyer purchases → Atomic ownership transfer
   → Listing becomes SOLD
   → Transaction (INVESTMENT) created
   → Notifications for both parties
```

---

## Testing

```bash
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

---

## Deployment

### Preparation

```bash
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

### Production Environment Variables

```bash
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

- **WSGI Server**: Gunicorn
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL
- **Cache**: Redis (optional)

```bash
gunicorn config.wsgi:application --workers 4
```
