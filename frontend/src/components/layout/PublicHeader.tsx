import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from '@/store'
import { Button } from '@/components/common'
import {
  Menu, X, ChevronDown, LogOut, User, LayoutDashboard,
  Sun, Moon, Shield, TrendingUp, FolderOpen, Store,
} from 'lucide-react'

interface PublicHeaderProps {
  variant?: 'transparent' | 'solid'
}

export function PublicHeader({ variant = 'solid' }: PublicHeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isDark, toggle: toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isTransparent = variant === 'transparent' && !scrolled && !mobileOpen

  const handleLogout = () => {
    logout()
    navigate('/')
    setProfileOpen(false)
    setMobileOpen(false)
  }

  const role = user?.role
  const isAdmin = role === 'ADMIN'

  return (
    <header
      className={`public-header ${isTransparent ? 'header-transparent' : 'header-solid'}`}
    >
      <div className="header-inner">
        {/* Left: Brand / Logo with proper padding */}
        <div className="flex items-center min-w-[180px]">
          <Link to="/" className="header-brand group">
            <div className="header-brand-logo transition-transform duration-200 group-hover:scale-105 shadow-sm">
              FS
            </div>
            <span className="header-brand-name">Fundsy</span>
          </Link>
        </div>

        {/* Center: Main Navigation (Centered with generous equal spacing) */}
        <nav className="header-nav-centered" aria-label="Navigation principale">
          <Link to="/about" className="header-nav-link-premium">
            Comment ça marche
          </Link>
          <Link to="/projects" className="header-nav-link-premium">
            Opportunités
          </Link>
          <Link to="/pools" className="header-nav-link-premium">
            Pools
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="header-nav-link-premium">
              Tableau de bord
            </Link>
          )}
        </nav>

        {/* Right: Actions (Completely Redesigned Sleek Fintech Actions) */}
        <div className="header-actions-premium min-w-[180px] justify-end">
          {/* Sleek Minimal Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-premium"
            aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
            title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          {isAuthenticated ? (
            <div className="profile-dropdown-wrapper" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="profile-avatar-btn"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <div className="profile-avatar">
                  {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown
                  className={`hidden h-4 w-4 text-[var(--text-muted)] sm:block transition-transform duration-200 ${
                    profileOpen ? 'rotate-180 text-[var(--text-primary)]' : ''
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="profile-dropdown-menu animate-fade-in">
                  <div className="profile-dropdown-header">
                    <p className="profile-dropdown-username truncate">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                    </p>
                    <p className="profile-dropdown-email truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1.5 space-y-0.5">
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="profile-dropdown-item"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[var(--accent)]" /> Tableau de bord
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="profile-dropdown-item"
                    >
                      <User className="h-4 w-4 text-[var(--text-muted)]" /> Profil
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="profile-dropdown-item"
                      >
                        <Shield className="h-4 w-4 text-[var(--warning)]" /> Administration
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-[var(--border-subtle)] pt-1.5">
                    <button
                      onClick={handleLogout}
                      className="profile-dropdown-item profile-dropdown-item-danger"
                    >
                      <LogOut className="h-4 w-4" /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="btn-header-login"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="btn-header-register"
              >
                <span>S'inscrire</span>
              </Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="header-mobile-toggle"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="header-mobile-drawer animate-fade-in">
          <nav className="mx-auto max-w-[1320px] px-4 py-4 space-y-1.5" aria-label="Navigation mobile">
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="flex items-center min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
            >
              Comment ça marche
            </Link>
            <Link
              to="/projects"
              onClick={() => setMobileOpen(false)}
              className="flex items-center min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
            >
              Opportunités d'investissement
            </Link>
            <Link
              to="/pools"
              onClick={() => setMobileOpen(false)}
              className="flex items-center min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
            >
              Pools de liquidité
            </Link>

            {isAuthenticated ? (
              <>
                <div className="my-3 border-t border-[var(--border-subtle)]" />
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                >
                  <LayoutDashboard className="h-4 w-4 text-[var(--accent)]" /> Tableau de bord
                </Link>
                {role === 'INVESTOR' && (
                  <>
                    <Link
                      to="/investments"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <TrendingUp className="h-4 w-4 text-[var(--accent)]" /> Mes investissements
                    </Link>
                    <Link
                      to="/market"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <Store className="h-4 w-4 text-[var(--accent)]" /> Marché secondaire
                    </Link>
                  </>
                )}
                {role === 'PROJECT_OWNER' && (
                  <Link
                    to="/projects/mine"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <FolderOpen className="h-4 w-4 text-[var(--accent)]" /> Mes projets
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <Shield className="h-4 w-4 text-[var(--warning)]" /> Administration
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                >
                  <User className="h-4 w-4 text-[var(--text-muted)]" /> Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--error)] hover:bg-[var(--error-light)]"
                >
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              </>
            ) : (
              <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-2.5">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full">
                  <button className="btn-header-login w-full justify-center py-2.5">
                    Connexion
                  </button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full">
                  <button className="btn-header-register w-full justify-center py-2.5">
                    S'inscrire
                  </button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
