import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, Badge, EmptyState, TableRowSkeleton, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, Button, Modal } from '@/components/common'
import { formatDate, exportToCSV, exportToPDF } from '@/utils'
import { useAdminUsers, useDeleteUser } from '@/hooks'
import { Search, Shield, Trash2, AlertTriangle, Download, Printer } from 'lucide-react'
import type { User } from '@/types'

const roleLabel: Record<string, string> = {
  INVESTOR: 'Investisseur',
  PROJECT_OWNER: 'Porteur de projet',
  INSURER: 'Assureur',
  ADMIN: 'Admin',
}

const roleVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  INVESTOR: 'info',
  PROJECT_OWNER: 'success',
  INSURER: 'warning',
  ADMIN: 'danger',
}

export default function AdminUsersPage() {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const { data, isLoading } = useAdminUsers(search ? { search } : undefined)
  const deleteUser = useDeleteUser()

  const users: User[] = data?.results ?? []

  const handleExportCSV = () => {
    exportToCSV('liste_utilisateurs', [
      { header: 'ID', accessor: (u) => u.id },
      { header: 'Nom d\'utilisateur', accessor: (u) => u.username },
      { header: 'Email', accessor: (u) => u.email },
      { header: 'Rôle', accessor: (u) => (u.role && roleLabel[u.role]) ? roleLabel[u.role] : (u.role || '') },
      { header: 'Statut', accessor: (u) => u.is_active !== false ? 'Actif' : 'Inactif' },
      { header: 'Date d\'inscription', accessor: (u) => u.date_joined ? formatDate(u.date_joined) : '' },
    ], users)
  }

  const handleExportPDF = () => {
    exportToPDF('Roster des Utilisateurs', [
      { header: 'Nom d\'utilisateur', accessor: (u) => u.username },
      { header: 'Email', accessor: (u) => u.email },
      { header: 'Rôle', accessor: (u) => (u.role && roleLabel[u.role]) ? roleLabel[u.role] : (u.role || '') },
      { header: 'Statut', accessor: (u) => u.is_active !== false ? 'Actif' : 'Inactif' },
      { header: 'Inscrit le', accessor: (u) => u.date_joined ? formatDate(u.date_joined) : '—' },
    ], users)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Gestion des Utilisateurs</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Consultez, recherchez et gérez les comptes membres de la plateforme.</p>
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

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par nom d'utilisateur, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-fintech pl-10"
          />
        </div>

        <Card padding={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden sm:table-cell">Inscrit le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={6} />
                  ))
                : users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center text-xs font-bold border border-[var(--border-subtle)]">
                            {user.username[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-[var(--text-primary)]">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-[var(--text-secondary)]">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleVariant[user.role ?? 'INVESTOR']}>
                          {user.role === 'ADMIN' && <Shield className="h-3 w-3 mr-1" />}
                          {roleLabel[user.role ?? 'INVESTOR'] ?? user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${user.is_active !== false ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--error-light)] text-[var(--error)]'}`}>
                          {user.is_active !== false ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-[var(--text-muted)]">{user.date_joined ? formatDate(user.date_joined) : '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
          {!isLoading && users.length === 0 && <EmptyState title="Aucun utilisateur trouvé" />}
        </Card>
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer l'utilisateur"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-[var(--error-light)] bg-[var(--error-light)] p-4">
            <AlertTriangle className="h-5 w-5 text-[var(--error)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--error)]">
              Cette action est irréversible. L'utilisateur <strong>{deleteTarget?.username}</strong> sera définitivement supprimé de la base de données.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteUser.isPending}>
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
