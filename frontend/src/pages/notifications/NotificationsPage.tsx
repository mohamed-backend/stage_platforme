import { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks'
import { Button, EmptyState, Skeleton, Badge } from '@/components/common'
import { formatDate } from '@/utils'
import { DashboardLayout } from '@/components/layout'
import { Bell, TrendingUp, CreditCard, FolderOpen, Store, Info, CheckCircle2, ArrowUpRight } from 'lucide-react'

const typeConfig: Record<string, { icon: any; bg: string; color: string; label: string }> = {
  INVESTMENT:  { icon: TrendingUp,  bg: 'var(--accent-muted)',    color: 'var(--accent)',    label: 'Investissement' },
  PAYMENT:     { icon: CreditCard,  bg: 'var(--warning-light)',   color: 'var(--warning)',   label: 'Paiement' },
  TRANSACTION: { icon: ArrowUpRight,bg: 'var(--success-light)',   color: 'var(--success)',   label: 'Transaction' },
  MARKET:      { icon: Store,       bg: 'var(--accent-muted)',    color: 'var(--accent)',    label: 'Marché' },
  PROJECT:     { icon: FolderOpen,  bg: 'var(--surface-secondary)',color: 'var(--text-secondary)', label: 'Projet' },
  SYSTEM:      { icon: Info,        bg: 'var(--accent-muted)',    color: 'var(--accent)',    label: 'Système' },
}

const filterTabs = [
  { key: 'all', label: 'Toutes' },
  { key: 'unread', label: 'Non lues' },
  ...Object.entries(typeConfig).map(([key, cfg]) => ({ key, label: cfg.label })),
] as const

type FilterKey = typeof filterTabs[number]['key']

function getDateGroup(dateStr: string): 'today' | 'this_week' | 'earlier' {
  const d = new Date(dateStr)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)

  if (d >= startOfToday) return 'today'
  if (d >= startOfWeek) return 'this_week'
  return 'earlier'
}

const dateGroupLabels: Record<string, string> = {
  today: "Aujourd'hui",
  this_week: 'Cette semaine',
  earlier: 'Plus tôt',
}

export default function NotificationsPage() {
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const { data, isLoading } = useNotifications({ page_size: 50 })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const notifications = data?.results || []
  const unreadCount = notifications.filter((n: any) => !n.is_read).length

  const filtered = useMemo(() => {
    if (activeFilter === 'unread') return notifications.filter((n: any) => !n.is_read)
    if (activeFilter !== 'all') return notifications.filter((n: any) => n.type === activeFilter)
    return notifications
  }, [notifications, activeFilter])

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = { today: [], this_week: [], earlier: [] }
    for (const notif of filtered) {
      groups[getDateGroup(notif.created_at)].push(notif)
    }
    return groups
  }, [filtered])

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold tracking-tight lg:text-[32px]">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <Badge variant="danger" className="px-2.5 py-0.5 text-xs font-bold">
                  {unreadCount} non {unreadCount === 1 ? 'lue' : 'lues'}
                </Badge>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-base">Restez informé de vos activités.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={unreadCount === 0 || markAllRead.isPending}
          >
            <CheckCircle2 className="h-4 w-4" />
            Tout marquer comme lu
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const active = activeFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
                style={{
                  background: active ? 'var(--accent)' : 'var(--surface-secondary)',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {tab.label}
                {tab.key === 'unread' && unreadCount > 0 && (
                  <span
                    className="ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ background: 'var(--error)', color: '#ffffff' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Aucune notification"
            description={
              activeFilter === 'unread'
                ? "Toutes vos notifications ont été lues."
                : "Vous n'avez aucune notification."
            }
            icon={<Bell className="h-7 w-7" />}
          />
        ) : (
          <div className="space-y-8">
            {(Object.keys(dateGroupLabels) as Array<keyof typeof dateGroupLabels>).map((groupKey) => {
              const items = grouped[groupKey]
              if (items.length === 0) return null
              return (
                <div key={groupKey}>
                  <h2 style={{ color: 'var(--text-muted)' }} className="mb-3 text-xs font-bold uppercase tracking-wider">
                    {dateGroupLabels[groupKey]}
                  </h2>
                  <div className="space-y-3">
                    {items.map((notif: any) => {
                      const config = typeConfig[notif.type] || typeConfig.SYSTEM
                      const Icon = config.icon
                      return (
                        <div
                          key={notif.id}
                          onClick={() => !notif.is_read && markRead.mutate(notif.id)}
                          role="button"
                          tabIndex={0}
                          className="flex cursor-pointer items-start gap-4 rounded-xl p-4 transition-all hover:shadow-sm"
                          style={{
                            background: 'var(--surface-primary)',
                            border: '1px solid var(--border-subtle)',
                            borderLeft: !notif.is_read ? '4px solid var(--accent)' : '1px solid var(--border-subtle)',
                          }}
                        >
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                            style={{ background: config.bg, color: config.color }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3
                                className="text-sm"
                                style={{
                                  color: 'var(--text-primary)',
                                  fontWeight: !notif.is_read ? '700' : '600',
                                }}
                              >
                                {notif.title}
                              </h3>
                              {!notif.is_read && (
                                <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />
                              )}
                            </div>
                            <p style={{ color: 'var(--text-secondary)' }} className="mt-1 text-sm leading-relaxed">{notif.message}</p>
                            <p style={{ color: 'var(--text-muted)' }} className="mt-2 text-xs">{formatDate(notif.created_at)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
