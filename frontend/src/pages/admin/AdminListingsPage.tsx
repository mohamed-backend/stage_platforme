import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, EmptyState, TableRowSkeleton, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, StatusBadge } from '@/components/common'
import { formatCurrency, formatDate } from '@/utils'
import { useAdminListings } from '@/hooks'
import type { Listing } from '@/types'

export default function AdminListingsPage() {
  const location = useLocation()
  const { data, isLoading } = useAdminListings()

  const listings: Listing[] = data?.results ?? []

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Gestion des Annonces</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Supervision des ordres de vente et d'achat sur le marché secondaire.</p>
        </div>
        <Card padding={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendeur</TableHead>
                <TableHead>Projet</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={5} />
                  ))
                : listings.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-semibold text-[var(--text-primary)]">{l.seller_username || l.seller}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{l.project_detail?.title || l.investment_detail?.project_title || `#${l.project}`}</TableCell>
                      <TableCell className="font-bold text-[var(--text-primary)]">{formatCurrency(l.price)}</TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                      <TableCell className="text-[var(--text-muted)]">{formatDate(l.created_at)}</TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
          {!isLoading && listings.length === 0 && <EmptyState title="Aucune annonce" />}
        </Card>
      </div>
    </DashboardLayout>
  )
}
