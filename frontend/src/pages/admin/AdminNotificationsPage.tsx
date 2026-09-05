import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, EmptyState, TableRowSkeleton, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, StatusBadge } from '@/components/common'
import { formatDate } from '@/utils'
import { useAdminNotifications } from '@/hooks'
import type { Notification } from '@/types'
import { Bell, CheckCircle } from 'lucide-react'

export default function AdminNotificationsPage() {
  const location = useLocation()
  const { data, isLoading } = useAdminNotifications()

  const notifications: Notification[] = data?.results ?? []

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Gestion des Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Historique des notifications système délivrées aux utilisateurs.</p>
        </div>
        <Card padding={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Lue</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={5} />
                  ))
                : notifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-semibold text-[var(--text-primary)]">{n.user}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {n.is_read ? <CheckCircle className="h-4 w-4 text-[var(--success)]" /> : <Bell className="h-4 w-4 text-[var(--accent)]" />}
                          <span className={n.is_read ? 'text-[var(--text-secondary)]' : 'font-semibold text-[var(--text-primary)]'}>{n.title}</span>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={n.type} /></TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${n.is_read ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--warning-light)] text-[var(--warning)]'}`}>
                          {n.is_read ? 'Oui' : 'Non'}
                        </span>
                      </TableCell>
                      <TableCell className="text-[var(--text-muted)]">{formatDate(n.created_at)}</TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
          {!isLoading && notifications.length === 0 && <EmptyState title="Aucune notification" />}
        </Card>
      </div>
    </DashboardLayout>
  )
}
