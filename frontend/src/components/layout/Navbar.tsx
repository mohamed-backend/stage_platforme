import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from '@/store'
import { useNotifications } from '@/hooks'
import { Button } from '@/components/common'
import {
  Menu, X, Bell, ChevronDown, LogOut, User,
  LayoutDashboard, Moon, Sun, Shield,
  TrendingUp, Store, FileText, CheckCircle2,
} from 'lucide-react'

const roleLabels: Record<string, string> = {
  INVESTOR: 'Investisseur',
  PROJECT_OWNER: 'Porteur de projet',
  INSURER: 'Assureur',
  ADMIN: 'Administrateur',
}

export function Navbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const { data: notifications } = useNotifications({ page_size: 100 }, isAuthenticated)
  const unreadCount = (notifications?.results || []).filter((n: any) => !n.is_read).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setProfileOpen(false)
    setMobileMenuOpen(false)
  }

  const role = user?.role
  const isAdmin = role === 'ADMIN'
  const roleLabel = role ? roleLabels[role] || role : 'Membre'

  return (
    <header className="sticky top-0 z-40 h-[var(--header-height)] border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]/85 dark:bg-[var(--bg-primary)]/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Sidebar trigger + Logo */}
        <div className="flex items-center gap-3">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Ouvrir le menu latéral"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#be185d] shadow-sm shadow-[var(--accent)]/30 transition-transform group-hover:scale-105">
              <span className="text-sm font-extrabold text-white tracking-tight">FS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] leading-tight">Fundsy</span>
              <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider hidden sm:block">Fintech Platform</span>
            </div>
          </Link>
        </div>

        {/* Desktop Public Nav */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Navigation principale">
          <Link
            to="/projects"
            className="rounded-xl px-3.5 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            Opportunités
          </Link>
          <Link
            to="/pools"
            className="rounded-xl px-3.5 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            Pools
          </Link>
          <Link
            to="/about"
            className="rounded-xl px-3.5 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            Comment ça marche
          </Link>
          {isAuthenticated && role === 'INVESTOR' && (
            <Link
              to="/market"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              Marché secondaire
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notification bell */}
              <Link
                to="/notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile button & dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl p-1.5 transition-all hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-subtle)]"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#be185d] text-xs font-bold text-white shadow-xs">
                    {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-bold text-[var(--text-primary)] leading-tight truncate max-w-[100px]">
                      {user?.first_name ? `${user.first_name}` : user?.username}
                    </p>
                    <p className="text-[10px] font-medium text-[var(--text-muted)] leading-none truncate">{roleLabel}</p>
                  </div>
                  <ChevronDown className={`hidden h-3.5 w-3.5 text-[var(--text-muted)] sm:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] p-1.5 shadow-xl z-50 animate-fade-in">
                    <div className="border-b border-[var(--border-subtle)] px-3 py-2.5">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-light)] text-[var(--accent)]">
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] rounded-lg transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <LayoutDashboard className="h-4 w-4 text-[var(--accent)]" /> Tableau de bord
                      </Link>
                      <Link
                        to="/investments"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] rounded-lg transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <TrendingUp className="h-4 w-4 text-[var(--success)]" /> Mes investissements
                      </Link>
                      <Link
                        to="/kyc"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] rounded-lg transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <FileText className="h-4 w-4 text-[var(--warning)]" /> Vérification KYC
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] rounded-lg transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <User className="h-4 w-4 text-[var(--text-muted)]" /> Profil & Paramètres
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] rounded-lg transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                        >
                          <Shield className="h-4 w-4 text-amber-500" /> Administration
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-[var(--border-subtle)] pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--error)] rounded-lg transition-colors hover:bg-[var(--error-light)]"
                      >
                        <LogOut className="h-4 w-4" /> Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link to="/register">
                <Button variant="accent" size="sm">S'inscrire</Button>
              </Link>
            </div>
          )}

          {!onOpenSidebar && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] md:hidden"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Public mobile drawer */}
      {!onOpenSidebar && mobileMenuOpen && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] md:hidden max-h-[calc(100vh-var(--header-height))] overflow-y-auto">
          <nav className="mx-auto max-w-[1440px] space-y-1 px-4 py-3" aria-label="Navigation mobile">
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              Opportunités
            </Link>
            <Link
              to="/pools"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              Pools
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              Comment ça marche
            </Link>
            {isAuthenticated ? (
              <>
                <div className="my-2 border-t border-[var(--border-subtle)]" />
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 min-h-[44px] rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                >
                  <LayoutDashboard className="h-4 w-4 text-[var(--accent)]" /> Tableau de bord
                </Link>
                <Link
                  to="/investments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 min-h-[44px] rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                >
                  <TrendingUp className="h-4 w-4 text-[var(--success)]" /> Mes investissements
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 min-h-[44px] rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                >
                  <User className="h-4 w-4 text-[var(--text-muted)]" /> Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 min-h-[44px] rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--error)] hover:bg-[var(--error-light)]"
                >
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="outline" className="w-full justify-center" size="sm">Connexion</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="accent" className="w-full justify-center" size="sm">S'inscrire</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
