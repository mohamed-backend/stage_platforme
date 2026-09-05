# Frontend - React Application

React SPA for the Stage Platform crowdfunding application. Full-featured interface with authentication, investment management, secondary market, claims, and admin/insurer dashboards.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Architecture](#architecture)
- [Routing](#routing)
- [API Layer](#api-layer)
- [State Management](#state-management)
- [Styling](#styling)
- [Internationalization](#internationalization)
- [Testing](#testing)
- [Available Scripts](#available-scripts)

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | UI framework |
| TypeScript | 6.0 | Static typing |
| Vite | 8.2 | Bundler and dev server (port 5173) |
| Tailwind CSS | 4.3 | Utility-first CSS |
| React Router | 7.18 | Client-side routing |
| TanStack Query | 5.102 | Server state management and caching |
| Zustand | 5.0 | Client state (auth, theme) |
| React Hook Form | 7.87 | Form management |
| Zod | 3.25 | Schema validation |
| Axios | 1.20 | HTTP client |
| Recharts | 3.10 | Charts and data visualization |
| i18next | 26.4 | Internationalization (French) |
| Lucide React | 1.39 | Icons |
| Sonner | 2.0 | Toast notifications |
| Vitest | 4.1 | Unit testing |
| Playwright | 1.62 | E2E testing |
| Oxlint | 1.79 | Linting |

---

## Project Structure

```
frontend/
├── src/
│   ├── api/                        # API layer
│   │   ├── axios.ts                #   Axios instance + JWT interceptor + refresh queue
│   │   ├── auth.api.ts             #   Authentication endpoints
│   │   ├── projects.api.ts         #   Project endpoints
│   │   ├── pools.api.ts            #   Pool endpoints
│   │   ├── investments.api.ts      #   Investment endpoints
│   │   ├── payments.api.ts         #   Payment endpoints
│   │   ├── transactions.api.ts     #   Transaction endpoints
│   │   ├── market.api.ts           #   Secondary market endpoints
│   │   ├── notifications.api.ts    #   Notification endpoints
│   │   ├── claims.api.ts           #   Claim endpoints
│   │   ├── risk.api.ts             #   Risk management endpoints
│   │   ├── admin.api.ts            #   Admin endpoints
│   │   ├── insurer.api.ts          #   Insurer endpoints
│   │   └── index.ts                #   Barrel exports
│   │
│   ├── components/
│   │   ├── common/                 #   Reusable UI components
│   │   │   ├── Badge.tsx           #     Status badges
│   │   │   ├── Button.tsx          #     Button variants
│   │   │   ├── Card.tsx            #     Card containers
│   │   │   ├── Input.tsx           #     Form inputs
│   │   │   ├── Select.tsx          #     Dropdowns
│   │   │   ├── Modal.tsx           #     Modal dialogs
│   │   │   ├── LoadingSpinner.tsx  #     Loading states
│   │   │   ├── Toast.tsx           #     Toast notifications (Sonner)
│   │   │   ├── Table.tsx           #     Data tables
│   │   │   ├── StatCard.tsx        #     Statistics display
│   │   │   ├── ProgressBar.tsx     #     Progress indicators
│   │   │   ├── StatusBadge.tsx     #     Status indicators
│   │   │   ├── States.tsx          #     Empty/error/loading states
│   │   │   ├── ProjectCard.tsx     #     Project display card
│   │   │   ├── RiskBadge.tsx       #     Risk level badges
│   │   │   ├── RiskRadarChart.tsx  #     Risk factor radar chart
│   │   │   ├── KycAlertBanner.tsx  #     KYC status alert
│   │   │   ├── CheckoutModal.tsx   #     Investment checkout
│   │   │   ├── Stepper.tsx         #     Multi-step flows
│   │   │   └── WizardLayout.tsx    #     Wizard container
│   │   │
│   │   └── layout/                 #   Layout components
│   │       ├── Navbar.tsx          #     Top navigation bar
│   │       ├── PublicHeader.tsx    #     Public page header
│   │       ├── Sidebar.tsx         #     Dashboard sidebar
│   │       ├── MobileBottomNav.tsx #     Mobile bottom navigation
│   │       ├── DashboardLayout.tsx #     Authenticated layout
│   │       ├── PublicLayout.tsx    #     Public page layout
│   │       └── Footer.tsx          #     Page footer
│   │
│   ├── hooks/                      # TanStack Query hooks (1 per domain)
│   │   ├── useAuth.ts              #   Authentication
│   │   ├── useProjects.ts          #   Projects
│   │   ├── usePools.ts             #   Pools
│   │   ├── useInvestments.ts       #   Investments
│   │   ├── usePayments.ts          #   Payments
│   │   ├── useTransactions.ts      #   Transactions
│   │   ├── useMarket.ts            #   Secondary market
│   │   ├── useNotifications.ts     #   Notifications
│   │   ├── useClaims.ts            #   Claims
│   │   ├── useRisk.ts              #   Risk management
│   │   ├── useAdmin.ts             #   Admin operations
│   │   ├── useInsurer.ts           #   Insurer operations
│   │   └── index.ts                #   Barrel exports
│   │
│   ├── pages/                      # Page components (16 domains)
│   │   ├── landing/                #   LandingPage, AboutPage
│   │   ├── auth/                   #   LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage
│   │   ├── dashboard/              #   DashboardPage
│   │   ├── projects/               #   ProjectsPage, ProjectDetailPage, CreateProjectPage,
│   │   │                           #   EditProjectPage, MyProjectsPage, FundingTrackingPage
│   │   ├── pools/                  #   PoolsPage, PoolDetailPage, CreatePoolPage, MyPoolsPage
│   │   ├── investments/            #   InvestmentsPage, InvestmentDetailPage, NewInvestmentPage
│   │   ├── payments/               #   PaymentsPage, PaymentDetailPage
│   │   ├── transactions/           #   TransactionsPage, TransactionDetailPage
│   │   ├── market/                 #   MarketPage, ListingDetailPage, MyListingsPage, NewListingPage
│   │   ├── notifications/          #   NotificationsPage
│   │   ├── risk/                   #   RiskPage
│   │   ├── kyc/                    #   KYCPage
│   │   ├── claims/                 #   ClaimsPage, ClaimDetailPage, AdminClaimsPage
│   │   ├── profile/                #   ProfilePage
│   │   ├── admin/                  #   8 admin pages (Dashboard, Users, Projects, etc.)
│   │   └── insurer/                #   5 insurer pages (Dashboard, KYCReview, Projects, Coverage, Reports)
│   │
│   ├── routes/                     # Route configuration
│   │   ├── ProtectedRoute.tsx      #   ProtectedRoute, AdminRoute, InsurerRoute
│   │   ├── RouteErrorBoundary.tsx  #   Error boundary for routes
│   │   └── index.ts                #   Barrel exports
│   │
│   ├── store/                      # Zustand stores
│   │   ├── auth.store.ts           #   Auth state (user, tokens, persist to localStorage)
│   │   └── theme.store.ts          #   Theme state (dark mode toggle)
│   │
│   ├── types/                      # Shared TypeScript types
│   │   ├── api.ts                  #   PaginatedResponse<T> + normalizePaginated()
│   │   ├── user.ts                 #   User, UserRole, AuthTokens
│   │   ├── project.ts              #   Project, ProjectStatus, RiskLevel
│   │   ├── investment.ts           #   Investment, InvestmentStatus
│   │   ├── payment.ts              #   Payment, PaymentMethod
│   │   ├── transaction.ts          #   Transaction, TransactionType
│   │   ├── listing.ts              #   Listing, ListingStatus
│   │   ├── notification.ts         #   Notification, NotificationType
│   │   ├── risk.ts                 #   RiskAssessment
│   │   ├── claims.ts               #   Claim, ClaimNote
│   │   ├── admin.ts                #   AdminStats
│   │   └── index.ts                #   Barrel exports
│   │
│   ├── styles/                     # CSS design system
│   │   ├── main.css                #   Main CSS entry
│   │   ├── base.css                #   Base styles
│   │   ├── variables.css           #   CSS custom properties (light + dark modes)
│   │   ├── components/             #   Component-specific CSS
│   │   ├── layout/                 #   Layout CSS
│   │   └── pages/                  #   Page-specific CSS
│   │
│   ├── config/
│   │   └── site.config.ts          #   Brand config ("Fundsy"), navigation, footer
│   │
│   ├── i18n/
│   │   └── index.ts                #   i18next config (French)
│   │
│   ├── utils/                      # Utility functions
│   │   ├── cn.ts                   #   cn(), formatCurrency, formatDate, formatApiError
│   │   ├── styles.ts               #   Risk/status color mappings
│   │   └── exportUtils.ts          #   exportToCSV, exportToPDF
│   │
│   ├── assets/                     # Static assets (images, icons)
│   │
│   ├── test/
│   │   └── setup.ts                #   Vitest test setup
│   │
│   ├── App.tsx                     # Root component (routes + QueryClient + ErrorBoundary)
│   ├── main.tsx                    # Entry point (StrictMode, dark mode init)
│   └── index.css                   # Global styles + Tailwind integration
│
├── e2e/                            # Playwright E2E test specs
│   ├── auth.spec.ts
│   ├── landing.spec.ts
│   ├── navigation.spec.ts
│   └── projects.spec.ts
│
├── index.html                      # Entry HTML
├── package.json
├── vite.config.ts                  # Vite config (proxy, alias, build)
├── vitest.config.ts                # Vitest config
├── playwright.config.ts            # Playwright config
├── tsconfig.json                   # TypeScript project references
├── tsconfig.app.json               # App TypeScript config
├── tsconfig.node.json              # Node TypeScript config
├── .oxlintrc.json                  # Oxlint config
├── .env.development                # Dev environment
├── .env.production                 # Production environment
└── .env.example                    # Environment template
```

---

## Setup

### Environment Variables

```bash
copy .env.example .env    # Windows
cp .env.example .env      # Linux/Mac
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` (proxied in dev) |

### Vite Proxy

In development, `/api` requests are proxied to `http://127.0.0.1:8000` (configured in `vite.config.ts`).

### Path Aliases

The `@` alias is configured to point to `src/`:

```typescript
import { useAuth } from '@/hooks'
```

### Install and Run

```bash
npm install
npm run dev       # Start dev server on http://localhost:5173
```

---

## Architecture

### Data Flow

```
Page → Hook (useQuery/useMutation) → API Service (axios) → Backend REST
                ↓
        Zustand Store (auth state)
                ↓
        React Component (UI)
```

### Patterns

| Pattern | Implementation |
|---------|----------------|
| **Server State** | TanStack Query for caching and fetching |
| **Client State** | Zustand for auth and theme |
| **Forms** | React Hook Form + Zod for validation |
| **Routing** | React Router v7 with guards (ProtectedRoute, AdminRoute, InsurerRoute) |
| **Auth** | JWT with automatic refresh via Axios interceptors |
| **Styling** | Tailwind CSS (utility-first) + custom CSS design system |
| **Typing** | TypeScript strict mode with shared types |
| **Code Splitting** | All pages use `React.lazy()` for lazy loading |

### JWT Token Refresh

The Axios instance in `api/axios.ts` implements a token refresh queue:

1. On 401 response, the interceptor pauses all pending requests
2. Sends a single refresh request using the stored refresh token
3. On success, replays all queued requests with the new access token
4. On failure, clears auth state and redirects to login

---

## Routing

### Public Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | LandingPage | Home page |
| `/about` | AboutPage | About page |
| `/login` | LoginPage | Login form |
| `/register` | RegisterPage | Registration form |
| `/forgot-password` | ForgotPasswordPage | Password reset request |
| `/reset-password/:uid/:token` | ResetPasswordPage | Password reset form |
| `/projects` | ProjectsPage | Published projects listing |
| `/projects/:id` | ProjectDetailPage | Project detail |
| `/pools` | PoolsPage | Open pools listing |
| `/pools/:id` | PoolDetailPage | Pool detail |

### Protected Routes (Authenticated)

| Path | Component | Description |
|------|-----------|-------------|
| `/dashboard` | DashboardPage | User dashboard |
| `/profile` | ProfilePage | User profile |
| `/kyc` | KYCPage | KYC document submission |
| `/projects/create` | CreateProjectPage | Create new project |
| `/projects/mine` | MyProjectsPage | List own projects |
| `/projects/mine/funding` | FundingTrackingPage | Funding tracking |
| `/pools/create` | CreatePoolPage | Create new pool |
| `/pools/mine` | MyPoolsPage | List own pools |
| `/investments` | InvestmentsPage | List own investments |
| `/investments/new` | NewInvestmentPage | Create new investment |
| `/investments/:id` | InvestmentDetailPage | Investment detail |
| `/payments` | PaymentsPage | List own payments |
| `/payments/:id` | PaymentDetailPage | Payment detail |
| `/transactions` | TransactionsPage | List own transactions |
| `/transactions/:id` | TransactionDetailPage | Transaction detail |
| `/market` | MarketPage | Secondary market |
| `/market/new` | NewListingPage | Create listing |
| `/market/:id` | ListingDetailPage | Listing detail |
| `/my-listings` | MyListingsPage | List own listings |
| `/notifications` | NotificationsPage | User notifications |
| `/risk` | RiskPage | Risk assessments |
| `/claims` | ClaimsPage | List own claims |
| `/claims/:id` | ClaimDetailPage | Claim detail |

### Admin Routes

| Path | Component |
|------|-----------|
| `/admin` | AdminDashboardPage |
| `/admin/users` | AdminUsersPage |
| `/admin/projects` | AdminProjectsPage |
| `/admin/investments` | AdminInvestmentsPage |
| `/admin/payments` | AdminPaymentsPage |
| `/admin/transactions` | AdminTransactionsPage |
| `/admin/listings` | AdminListingsPage |
| `/admin/notifications` | AdminNotificationsPage |
| `/admin/claims` | AdminClaimsPage |

### Insurer Routes

| Path | Component |
|------|-----------|
| `/insurer` | InsurerDashboardPage |
| `/insurer/kyc` | InsurerKYCReviewPage |
| `/insurer/projects` | InsurerProjectReviewPage |
| `/insurer/coverage` | InsurerCoveragePage |
| `/insurer/reports` | InsurerReportingPage |

### Route Guards

| Guard | Requirement |
|-------|-------------|
| `ProtectedRoute` | User must be authenticated |
| `AdminRoute` | User must have `ADMIN` role |
| `InsurerRoute` | User must have `INSURER` or `ADMIN` role |

---

## API Layer

### Axios Instance (`api/axios.ts`)

- **Base URL**: `VITE_API_URL` or `/api`
- **Request interceptor**: Attaches `Authorization: Bearer <token>` header
- **Response interceptor**: Handles 401 → token refresh → request retry
- **Refresh queue**: Concurrent requests during refresh are queued and replayed

### API Services

Each domain has a dedicated service in `src/api/`:

| Service | Key Functions |
|---------|---------------|
| `auth.api.ts` | `login`, `register`, `logout`, `getMe`, `updateProfile`, `passwordReset` |
| `projects.api.ts` | `list`, `detail`, `create`, `update`, `submit`, `approve`, `reject`, `myProjects` |
| `pools.api.ts` | `list`, `detail`, `create`, `myPools` |
| `investments.api.ts` | `create`, `list`, `detail`, `ownerList` |
| `payments.api.ts` | `create`, `list`, `detail`, `confirm` |
| `transactions.api.ts` | `list`, `detail` |
| `market.api.ts` | `createListing`, `listMarket`, `myListings`, `cancel`, `buy` |
| `notifications.api.ts` | `list`, `markRead`, `markAllRead` |
| `claims.api.ts` | `list`, `create`, `detail`, `review`, `addNote` |
| `risk.api.ts` | `list`, `detail`, `calculate` |
| `admin.api.ts` | `stats`, `users`, `projects`, `investments`, `payments`, `transactions`, `listings`, `notifications` |
| `insurer.api.ts` | `stats`, `pendingKYC`, `coverageRules`, `reports` |

---

## State Management

### Zustand Stores

**Auth Store** (`store/auth.store.ts`):
- `user` — Current authenticated user
- `tokens` — JWT access and refresh tokens
- `isAuthenticated` — Boolean auth state
- `setAuth(user, tokens)` — Set auth state
- `logout()` — Clear state and blacklist refresh token server-side
- Persisted to `localStorage`

**Theme Store** (`store/theme.store.ts`):
- Dark/light mode toggle
- Persisted to `localStorage`
- Applied via CSS custom properties in `variables.css`

### TanStack Query Defaults

- `staleTime`: 5 minutes
- `retry`: 1 attempt
- `refetchOnWindowFocus`: Disabled

---

## Styling

### Dual System

1. **Tailwind CSS**: Utility-first classes for layout, spacing, typography
2. **Custom CSS Design System**: Component and page-specific styles

### Design Tokens (`styles/variables.css`)

CSS custom properties for both light and dark modes:

```css
:root {
  --bg-primary, --bg-secondary, --bg-tertiary
  --text-primary, --text-secondary, --text-muted
  --accent, --accent-hover
  --border-subtle, --border-default
  --error, --success, --warning
  /* ... */
}

[data-theme="dark"] {
  /* Dark mode overrides */
}
```

### Global Styles (`index.css`)

- Tailwind integration
- Glass-panel effects
- Skeleton loaders
- Page transitions

---

## Internationalization

i18next configuration with **French (FR)** as the default language.

Translation namespaces in `src/i18n/index.ts`:

| Namespace | Content |
|-----------|---------|
| `common` | Generic labels (loading, error, save, cancel...) |
| `nav` | Navigation items |
| `auth` | Authentication forms |
| `landing` | Landing page content |
| `projects` | Project-related strings |
| `investments` | Investment strings |
| `payments` | Payment strings |
| `transactions` | Transaction strings |
| `market` | Secondary market strings |
| `risk` | Risk management strings |
| `admin` | Admin panel strings |

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test           # Single run
npm run test:watch     # Watch mode
```

Components tested with `@testing-library/react` and `@testing-library/jest-dom`.

### E2E Tests (Playwright)

```bash
npm run test:e2e:install   # Install browsers (first time)
npm run test:e2e           # Run E2E tests
npm run test:e2e:headed    # Run with visible browser
```

### Linting

```bash
npm run lint   # Oxlint
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build (tsc + vite build) |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint with oxlint |
| `npm run test` | Unit tests (vitest) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:e2e` | E2E tests (playwright) |
| `npm run test:e2e:headed` | E2E tests with visible browser |
| `npm run test:e2e:install` | Install playwright browsers |
