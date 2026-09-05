import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, EmptyState, TableRowSkeleton, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, StatusBadge, Button } from '@/components/common'
import { formatCurrency, formatDate, exportToCSV, exportToPDF } from '@/utils'
import { useAdminTransactions } from '@/hooks'
import { Download, Printer } from 'lucide-react'
import type { Transaction } from '@/types'

const typeLabel: Record<string, string> = {
  INVESTMENT: 'Investissement',
  REFUND: 'Remboursement',
  WITHDRAWAL: 'Retrait',
  DEPOSIT: 'Dépôt',
}

export default function AdminTransactionsPage() {
  const location = useLocation()
  const { data, isLoading } = useAdminTransactions()

  const transactions: Transaction[] = data?.results ?? []

  const handleExportCSV = () => {
    exportToCSV('log_transactions_financieres', [
      { header: 'ID', accessor: (t) => t.id },
      { header: 'Référence', accessor: (t) => t.reference },
      { header: 'Utilisateur', accessor: (t) => t.user },
      { header: 'Type', accessor: (t) => typeLabel[t.type] || t.type },
      { header: 'Montant (€)', accessor: (t) => t.amount },
      { header: 'Statut', accessor: (t) => t.status },
      { header: 'Date', accessor: (t) => formatDate(t.created_at) },
    ], transactions)
  }

  const handleExportPDF = () => {
    exportToPDF('Log des Transactions Financières', [
      { header: 'Référence', accessor: (t) => t.reference },
      { header: 'Utilisateur', accessor: (t) => String(t.user) },
      { header: 'Type', accessor: (t) => typeLabel[t.type] || t.type },
      { header: 'Montant', accessor: (t) => formatCurrency(t.amount) },
      { header: 'Statut', accessor: (t) => t.status },
      { header: 'Date', accessor: (t) => formatDate(t.created_at) },
    ], transactions)
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Gestion des Transactions</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Traçabilité complète des dépôts, retraits, investissements et remboursements.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Printer className="h-4 w-4 mr-1" />
              Export PDF
            </Button>
          </div>
        </div>
        <Card padding={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Type</TableHead>
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
                : transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs font-semibold text-[var(--text-muted)]">{t.reference}</TableCell>
                      <TableCell className="font-semibold text-[var(--text-primary)]">{t.user}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{typeLabel[t.type] ?? t.type}</TableCell>
                      <TableCell className={`font-bold ${t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                        {t.type === 'DEPOSIT' || t.type === 'REFUND' ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                      </TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="text-[var(--text-muted)]">{formatDate(t.created_at)}</TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
          {!isLoading && transactions.length === 0 && <EmptyState title="Aucune transaction" />}
        </Card>
      </div>
    </DashboardLayout>
  )
}
