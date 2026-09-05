import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useNotifications } from '@/hooks'
import { cn } from '@/utils'
import type { UserRole } from '@/types'
import {
  LayoutDashboard, Compass, TrendingUp, Store,
  User, Bell, Plus, Shield, FileCheck,
  BarChart3, Users,
} from 'lucide-react'

interface BottomNavLink {
  to: string
  label: string
  icon: React.ReactNode
  roles?: UserRole[]
}

const investorLinks: BottomNavLink[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/projects', label: 'Découvrir', icon: <Compass className="h-5 w-5" /> },
  { to: '/investments', label: 'Investir', icon: <TrendingUp className="h-5 w-5" /> },
  { to: '/market', label: 'Marché', icon: <Store className="h-5 w-5" /> },
  { to: '/profile', label: 'Profil', icon: <User className="h-5 w-5" /> },
]

const projectOwnerLinks: BottomNavLink[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/projects/mine', label: 'Projets', icon: <Compass className="h-5 w-5" /> },
  { to: '/projects/create', label: 'Créer', icon: <Plus className="h-5 w-5" /> },
  { to: '/notifications', label: 'Alertes', icon: <Bell className="h-5 w-5" /> },
  { to: '/profile', label: 'Profil', icon: <User className="h-5 w-5" /> },
]

const insurerLinks: BottomNavLink[] = [
  { to: '/insurer', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/insurer/kyc', label: 'KYC', icon: <FileCheck className="h-5 w-5" /> },
  { to: '/insurer/projects', label: 'Projets', icon: <Shield className="h-5 w-5" /> },
  { to: '/insurer/coverage', label: 'Polices', icon: <Compass className="h-5 w-5" /> },
  { to: '/profile', label: 'Profil', icon: <User className="h-5 w-5" /> },
]

const adminLinks: BottomNavLink[] = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  { to: '/admin/projects', label: 'Projets', icon: <Compass className="h-5 w-5" /> },
  { to: '/admin/claims', label: 'Claims', icon: <Shield className="h-5 w-5" /> },
  { to: '/admin', label: 'Plus', icon: <BarChart3 className="h-5 w-5" /> },
]

function isActive(currentPath: string, to: string) {
  if (to === '/dashboard' || to === '/admin' || to === '/insurer') {
    return currentPath === to
  }
  return currentPath === to || currentPath.startsWith(to + '/')
}

export function MobileBottomNav() {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()
  const { data: notifications } = useNotifications({ page_size: 100 }, isAuthenticated)
  const notificationList = notifications?.results || []
  const unreadCount = notificationList.filter((n: any) => !n.is_read).length

  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const scrollHeight = document.documentElement.scrollHeight
        const clientHeight = window.innerHeight
        const atBottom = currentScrollY + clientHeight >= scrollHeight - 100

        if (atBottom) {
          setIsVisible(true)
        } else if (currentScrollY < lastScrollY.current) {
          setIsVisible(true)
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
          setIsVisible(false)
        }

        lastScrollY.current = currentScrollY
        ticking.current = false
      })
      ticking.current = true
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    setIsVisible(true)
  }, [location.pathname])

  const role = user?.role
  const isAdmin = role === 'ADMIN'
  const isProjectOwner = role === 'PROJECT_OWNER'
  const isInsurer = role === 'INSURER'

  const links = isAdmin
    ? adminLinks
    : isInsurer
      ? insurerLinks
      : isProjectOwner
        ? projectOwnerLinks
        : investorLinks

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t transition-all duration-300 ease-in-out safe-area-pb lg:hidden',
        'border-[var(--border-subtle)] bg-[var(--surface-primary)]/95 backdrop-blur-xl dark:bg-[var(--bg-secondary)]/95',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      )}
      aria-label="Navigation mobile"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {links.map((link) => {
          const active = isActive(location.pathname, link.to)
          const isNotifications = link.to === '/notifications'
          return (
            <Link
              key={link.to + link.label}
              to={link.to}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-200',
                active
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-[var(--accent)]" />
              )}
              <span className="relative flex items-center justify-center">
                {link.icon}
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] leading-tight">
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
