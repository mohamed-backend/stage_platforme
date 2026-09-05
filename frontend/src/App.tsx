import { Component, type ReactNode, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/common/Toast'
import { Toaster } from 'sonner'
import { ProtectedRoute, AdminRoute, InsurerRoute, RouteErrorBoundary } from '@/routes'

const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))
const AboutPage = lazy(() => import('@/pages/landing/AboutPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ProjectsPage = lazy(() => import('@/pages/projects/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/projects/ProjectDetailPage'))
const CreateProjectPage = lazy(() => import('@/pages/projects/CreateProjectPage'))
const MyProjectsPage = lazy(() => import('@/pages/projects/MyProjectsPage'))
const FundingTrackingPage = lazy(() => import('@/pages/projects/FundingTrackingPage'))
const PoolsPage = lazy(() => import('@/pages/pools/PoolsPage'))
const PoolDetailPage = lazy(() => import('@/pages/pools/PoolDetailPage'))
const CreatePoolPage = lazy(() => import('@/pages/pools/CreatePoolPage'))
const MyPoolsPage = lazy(() => import('@/pages/pools/MyPoolsPage'))
const InvestmentsPage = lazy(() => import('@/pages/investments/InvestmentsPage'))
const InvestmentDetailPage = lazy(() => import('@/pages/investments/InvestmentDetailPage'))
const NewInvestmentPage = lazy(() => import('@/pages/investments/NewInvestmentPage'))
const PaymentsPage = lazy(() => import('@/pages/payments/PaymentsPage'))
const PaymentDetailPage = lazy(() => import('@/pages/payments/PaymentDetailPage'))
const TransactionsPage = lazy(() => import('@/pages/transactions/TransactionsPage'))
const TransactionDetailPage = lazy(() => import('@/pages/transactions/TransactionDetailPage'))
const MarketPage = lazy(() => import('@/pages/market/MarketPage'))
const ListingDetailPage = lazy(() => import('@/pages/market/ListingDetailPage'))
const MyListingsPage = lazy(() => import('@/pages/market/MyListingsPage'))
const NewListingPage = lazy(() => import('@/pages/market/NewListingPage'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'))
const RiskPage = lazy(() => import('@/pages/risk/RiskPage'))
const KYCPage = lazy(() => import('@/pages/kyc/KYCPage'))
const ClaimsPage = lazy(() => import('@/pages/claims/ClaimsPage'))
const ClaimDetailPage = lazy(() => import('@/pages/claims/ClaimDetailPage'))
const AdminClaimsPage = lazy(() => import('@/pages/claims/AdminClaimsPage'))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminProjectsPage = lazy(() => import('@/pages/admin/AdminProjectsPage'))
const AdminInvestmentsPage = lazy(() => import('@/pages/admin/AdminInvestmentsPage'))
const AdminPaymentsPage = lazy(() => import('@/pages/admin/AdminPaymentsPage'))
const AdminTransactionsPage = lazy(() => import('@/pages/admin/AdminTransactionsPage'))
const AdminListingsPage = lazy(() => import('@/pages/admin/AdminListingsPage'))
const AdminNotificationsPage = lazy(() => import('@/pages/admin/AdminNotificationsPage'))
const InsurerDashboardPage = lazy(() => import('@/pages/insurer/InsurerDashboardPage'))
const InsurerKYCReviewPage = lazy(() => import('@/pages/insurer/InsurerKYCReviewPage'))
const InsurerProjectReviewPage = lazy(() => import('@/pages/insurer/InsurerProjectReviewPage'))
const InsurerCoveragePage = lazy(() => import('@/pages/insurer/InsurerCoveragePage'))
const InsurerReportingPage = lazy(() => import('@/pages/insurer/InsurerReportingPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--error-light)] mx-auto mb-4">
              <span className="text-2xl font-bold text-[var(--error)]">!</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Une erreur est survenue</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              L'application a rencontré un problème inattendu. Veuillez réessayer.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Return to homepage
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">Chargement...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

              {/* Public projects */}
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />

              {/* Project Owner routes */}
              <Route path="/projects/create" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
              <Route path="/projects/mine" element={<ProtectedRoute><MyProjectsPage /></ProtectedRoute>} />
              <Route path="/projects/mine/funding" element={<ProtectedRoute><FundingTrackingPage /></ProtectedRoute>} />

              {/* Public pools */}
              <Route path="/pools" element={<PoolsPage />} />
              <Route path="/pools/:id" element={<PoolDetailPage />} />

              {/* Project Owner pools */}
              <Route path="/pools/create" element={<ProtectedRoute><CreatePoolPage /></ProtectedRoute>} />
              <Route path="/pools/mine" element={<ProtectedRoute><MyPoolsPage /></ProtectedRoute>} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/kyc" element={<ProtectedRoute><KYCPage /></ProtectedRoute>} />

              <Route path="/investments" element={<ProtectedRoute><InvestmentsPage /></ProtectedRoute>} />
              <Route path="/investments/new" element={<ProtectedRoute><NewInvestmentPage /></ProtectedRoute>} />
              <Route path="/investments/:id" element={<ProtectedRoute><InvestmentDetailPage /></ProtectedRoute>} />

              <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
              <Route path="/payments/:id" element={<ProtectedRoute><PaymentDetailPage /></ProtectedRoute>} />

              <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
              <Route path="/transactions/:id" element={<ProtectedRoute><TransactionDetailPage /></ProtectedRoute>} />

              <Route path="/market" element={<ProtectedRoute><MarketPage /></ProtectedRoute>} />
              <Route path="/market/new" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
              <Route path="/market/:id" element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />
              <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />

              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/risk" element={<ProtectedRoute><RiskPage /></ProtectedRoute>} />
              <Route path="/claims" element={<ProtectedRoute><ClaimsPage /></ProtectedRoute>} />
              <Route path="/claims/:id" element={<ProtectedRoute><ClaimDetailPage /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
              <Route path="/admin/projects" element={<AdminRoute><AdminProjectsPage /></AdminRoute>} />
              <Route path="/admin/investments" element={<AdminRoute><AdminInvestmentsPage /></AdminRoute>} />
              <Route path="/admin/payments" element={<AdminRoute><AdminPaymentsPage /></AdminRoute>} />
              <Route path="/admin/transactions" element={<AdminRoute><AdminTransactionsPage /></AdminRoute>} />
              <Route path="/admin/listings" element={<AdminRoute><AdminListingsPage /></AdminRoute>} />
              <Route path="/admin/notifications" element={<AdminRoute><AdminNotificationsPage /></AdminRoute>} />
              <Route path="/admin/claims" element={<AdminRoute><AdminClaimsPage /></AdminRoute>} />

              {/* Insurer routes */}
              <Route path="/insurer" element={<InsurerRoute><InsurerDashboardPage /></InsurerRoute>} />
              <Route path="/insurer/kyc" element={<InsurerRoute><InsurerKYCReviewPage /></InsurerRoute>} />
              <Route path="/insurer/projects" element={<InsurerRoute><InsurerProjectReviewPage /></InsurerRoute>} />
              <Route path="/insurer/coverage" element={<InsurerRoute><InsurerCoveragePage /></InsurerRoute>} />
              <Route path="/insurer/reports" element={<InsurerRoute><InsurerReportingPage /></InsurerRoute>} />

              {/* 404 */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-[var(--text-muted)]">404</h1>
                    <p className="text-[var(--text-secondary)] mt-4">Page introuvable</p>
                    <a href="/" className="text-[var(--accent)] hover:text-[var(--accent-hover)] mt-4 inline-block">
                      Retour à l'accueil
                    </a>
                  </div>
                </div>
              } />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
