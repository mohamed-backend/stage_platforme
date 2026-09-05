import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { cn } from '@/utils'
import {
  LayoutDashboard, FolderOpen, TrendingUp, CreditCard,
  ArrowLeftRight, Store, Bell, Shield, User, Users,
  X, Plus, Tag, Megaphone, FileCheck, BarChart3, Layers, FileText, AlertTriangle,
  Compass, ChevronRight,
} from 'lucide-react'
import { useNotifications } from '@/hooks'

interface NavSection {
  title?: string
  links: {
    to: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string | number
  }[]
}

function isActive(currentPath: string, to: string) {
  if (to === '/dashboard' || to === '/admin' || to === '/insurer') return currentPath === to
  return currentPath === to || currentPath.startsWith(to + '/')
}

interface SidebarProps {
  currentPath: string
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

export function Sidebar({ currentPath, isMobileOpen, onCloseMobile }: SidebarProps) {
  const { user, isAuthenticated } = useAuthStore()
  const role = user?.role
  const isAdmin = role === 'ADMIN'
  const isProjectOwner = role === 'PROJECT_OWNER'
  const isInsurer = role === 'INSURER'
  const { data: notifications } = useNotifications({ page_size: 100 }, isAuthenticated)
  const unreadCount = (notifications?.results || []).filter((n: any) => !n.is_read).length

  const investorSections: NavSection[] = [
    {
      title: 'Navigation',
      links: [
        { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Découvrir',
      links: [
        { to: '/projects', label: 'Opportunités', icon: Compass },
        { to: '/pools', label: 'Pools d\'investissement', icon: Layers },
        { to: '/market', label: 'Marché secondaire', icon: Store },
      ],
    },
    {
      title: 'Portefeuille',
      links: [
        { to: '/investments', label: 'Mes investissements', icon: TrendingUp },
        { to: '/payments', label: 'Paiements', icon: CreditCard },
        { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
        { to: '/my-listings', label: 'Mes annonces', icon: Tag },
      ],
    },
    {
      title: 'Compte & Conformité',
      links: [
        { to: '/profile', label: 'Mon profil', icon: User },
        { to: '/kyc', label: 'Vérification KYC', icon: FileText },
        { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
        { to: '/claims', label: 'Réclamations', icon: AlertTriangle },
        { to: '/risk', label: 'Évaluation des risques', icon: Shield },
      ],
    },
  ]

  const projectOwnerSections: NavSection[] = [
    {
      title: 'Vue d\'ensemble',
      links: [
        { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Mes Projets',
      links: [
        { to: '/projects/mine', label: 'Mes projets', icon: FolderOpen },
        { to: '/projects/mine/funding', label: 'Suivi de financement', icon: BarChart3 },
        { to: '/projects/create', label: 'Créer un projet', icon: Plus },
      ],
    },
    {
      title: 'Mes Pools',
      links: [
        { to: '/pools/mine', label: 'Mes pools', icon: Layers },
        { to: '/pools/create', label: 'Créer un pool', icon: Plus },
      ],
    },
    {
      title: 'Découverte',
      links: [
        { to: '/projects', label: 'Tous les projets', icon: Megaphone },
        { to: '/pools', label: 'Tous les pools', icon: Layers },
      ],
    },
    {
      title: 'Compte',
      links: [
        { to: '/profile', label: 'Mon profil', icon: User },
        { to: '/kyc', label: 'Vérification KYC', icon: FileText },
        { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
      ],
    },
  ]

  const insurerSections: NavSection[] = [
    {
      title: 'Assurance & Risque',
      links: [
        { to: '/insurer', label: 'Vue d\'ensemble', icon: LayoutDashboard },
        { to: '/insurer/kyc', label: 'Validation KYC', icon: FileCheck },
        { to: '/insurer/projects', label: 'Évaluation Projets', icon: Shield },
        { to: '/insurer/coverage', label: 'Polices d\'assurance', icon: FolderOpen },
        { to: '/insurer/reports', label: 'Rapports & Audit', icon: BarChart3 },
        { to: '/admin/claims', label: 'Sinistres & Réclamations', icon: AlertTriangle },
      ],
    },
    {
      title: 'Compte',
      links: [
        { to: '/profile', label: 'Mon profil', icon: User },
        { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
      ],
    },
  ]

  const adminSections: NavSection[] = [
    {
      title: 'Administration',
      links: [
        { to: '/admin', label: 'Vue d\'ensemble', icon: LayoutDashboard },
        { to: '/admin/users', label: 'Utilisateurs', icon: Users },
        { to: '/admin/projects', label: 'Projets & Campagnes', icon: FolderOpen },
        { to: '/admin/investments', label: 'Investissements', icon: TrendingUp },
        { to: '/admin/payments', label: 'Paiements', icon: CreditCard },
        { to: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
        { to: '/admin/listings', label: 'Marché secondaire', icon: Store },
        { to: '/admin/claims', label: 'Réclamations', icon: AlertTriangle },
        { to: '/admin/notifications', label: 'Diffusions & Alertes', icon: Megaphone },
      ],
    },
    {
      title: 'Personnel',
      links: [
        { to: '/dashboard', label: 'Espace Investisseur', icon: LayoutDashboard },
        { to: '/profile', label: 'Mon profil', icon: User },
      ],
    },
  ]

  const sections = isAdmin ? adminSections : isInsurer ? insurerSections : isProjectOwner ? projectOwnerSections : investorSections

  const navContent = (
    <nav className="sidebar-nav" aria-label="Navigation latérale">
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="sidebar-link-group">
          {section.title && (
            <span className="sidebar-section-title">{section.title}</span>
          )}
          {section.links.map((link) => {
            const active = isActive(currentPath, link.to)
            const Icon = link.icon
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={cn(
                  'sidebar-link',
                  active && 'sidebar-link-active'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="sidebar-link-icon">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="truncate">{link.label}</span>
                {link.badge !== undefined && (
                  <span className="sidebar-link-badge">
                    {Number(link.badge) > 9 ? '9+' : link.badge}
                  </span>
                )}
                {active && !link.badge && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                )}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex sidebar-container">
        {navContent}
      </aside>

      {/* Mobile sidebar drawer */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md lg:hidden animate-fade-in"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-[var(--surface-primary)] dark:bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] shadow-2xl lg:hidden animate-fade-in">
            <div className="flex items-center justify-between px-5 h-[var(--header-height)] border-b border-[var(--border-subtle)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#be185d] text-white font-bold text-xs shadow-xs">
                  FS
                </div>
                <span className="text-base font-bold text-[var(--text-primary)]">Fundsy</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navContent}
          </div>
        </>
      )}
    </>
  )
}
