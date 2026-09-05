import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, EmptyState, TableRowSkeleton, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, StatusBadge } from '@/components/common'
import { formatCurrency, formatDate } from '@/utils'
import { useAdminInvestments } from '@/hooks'
import type { Investment } from '@/types'

export default function AdminInvestmentsPage() {
  const location = useLocation()
  const { data, isLoading } = useAdminInvestments()

  const investments: Investment[] = data?.results ?? []

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Gestion des Investissements</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Historique et supervision des engagements financiers sur la plateforme.</p>
        </div>
        <Card padding={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Projet</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={6} />
                  ))
                : investments.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs font-semibold text-[var(--text-muted)]">#{inv.id}</TableCell>
                      <TableCell className="font-semibold text-[var(--text-primary)]">{inv.user}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{inv.project_detail?.title ?? `Projet #${inv.project}`}</TableCell>
                      <TableCell className="font-bold text-[var(--text-primary)]">{formatCurrency(inv.amount)}</TableCell>
                      <TableCell><StatusBadge status={inv.status} /></TableCell>
                      <TableCell className="text-[var(--text-muted)]">{formatDate(inv.created_at)}</TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
          {!isLoading && investments.length === 0 && <EmptyState title="Aucun investissement" />}
        </Card>
      </div>
    </DashboardLayout>
  )
}
