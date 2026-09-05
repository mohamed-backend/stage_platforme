import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, EmptyState, TableRowSkeleton, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, ProgressBar, RiskBadge, StatusBadge, Button, Modal } from '@/components/common'
import { formatCurrency, exportToCSV, exportToPDF } from '@/utils'
import { useAdminProjects, useApproveProject, useRejectProject, useDeleteProjectAdmin } from '@/hooks'
import { Search, CheckCircle2, XCircle, Trash2, AlertTriangle, Download, Printer } from 'lucide-react'
import type { Project } from '@/types'

export default function AdminProjectsPage() {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([])
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)

  const { data, isLoading } = useAdminProjects(search ? { search } : undefined)
  const approveProject = useApproveProject()
  const rejectProject = useRejectProject()
  const deleteProject = useDeleteProjectAdmin()

  const projects: Project[] = data?.results ?? []
  const pendingProjects = projects.filter((p) => p.status === 'PENDING')
  const allPendingSelected = pendingProjects.length > 0 && pendingProjects.every((p) => selectedProjectIds.includes(p.id))

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedProjectIds([])
    } else {
      setSelectedProjectIds(pendingProjects.map((p) => p.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleBatchApprove = async () => {
    if (selectedProjectIds.length === 0) return
    setIsBatchProcessing(true)
    try {
      await Promise.all(selectedProjectIds.map((id) => approveProject.mutateAsync(id)))
      setSelectedProjectIds([])
    } catch {
      // error handled by DRF / react-query
    } finally {
      setIsBatchProcessing(false)
    }
  }

  const handleBatchReject = async () => {
    if (selectedProjectIds.length === 0) return
    setIsBatchProcessing(true)
    try {
      await Promise.all(selectedProjectIds.map((id) => rejectProject.mutateAsync(id)))
      setSelectedProjectIds([])
    } catch {
      // error
    } finally {
      setIsBatchProcessing(false)
    }
  }

  // Export all projects (existing behavior)
  const handleExportCSV = () => {
    exportToCSV('projets_admin', [
      { header: 'ID', accessor: (p) => p.id },
      { header: 'Titre', accessor: (p) => p.title },
      { header: 'Porteur', accessor: (p) => p.owner_username },
      { header: 'Objectif (€)', accessor: (p) => p.target_amount },
      { header: 'Collecté (€)', accessor: (p) => p.collected_amount },
      { header: 'Statut', accessor: (p) => p.status },
      { header: 'Risque', accessor: (p) => p.risk_level },
    ], projects)
  }

  // Export only selected projects
  const handleExportSelectedCSV = () => {
    const selected = projects.filter((p) => selectedProjectIds.includes(p.id))
    if (selected.length === 0) return
    exportToCSV('projets_admin_selection', [
      { header: 'ID', accessor: (p) => p.id },
      { header: 'Titre', accessor: (p) => p.title },
      { header: 'Porteur', accessor: (p) => p.owner_username },
      { header: 'Objectif (€)', accessor: (p) => p.target_amount },
      { header: 'Collecté (€)', accessor: (p) => p.collected_amount },
      { header: 'Statut', accessor: (p) => p.status },
      { header: 'Risque', accessor: (p) => p.risk_level },
    ], selected)
  }

  const handleExportPDF = () => {
    exportToPDF('Rapport de Gestion des Projets', [
      { header: 'Titre', accessor: (p) => p.title },
      { header: 'Porteur', accessor: (p) => p.owner_username },
      { header: 'Objectif', accessor: (p) => formatCurrency(p.target_amount) },
      { header: 'Collecté', accessor: (p) => formatCurrency(p.collected_amount) },
      { header: 'Statut', accessor: (p) => p.status },
      { header: 'Risque', accessor: (p) => p.risk_level },
    ], projects)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteProject.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Gestion des Projets</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Supervisez, approuvez et gérez les campagnes de financement.</p>
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

        {/* Batch Action Bar */}
        {selectedProjectIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent-muted)] p-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                {selectedProjectIds.length}
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                projet(s) sélectionné(s) pour action groupée
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                loading={isBatchProcessing}
                onClick={handleBatchApprove}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Approuver la sélection ({selectedProjectIds.length})
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={isBatchProcessing}
                onClick={handleBatchReject}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Rejeter la sélection ({selectedProjectIds.length})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedProjectIds([])}
              >
                Tout désélectionner
              </Button>
            </div>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-fintech pl-10"
          />
        </div>

        <Card padding={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allPendingSelected}
                    disabled={pendingProjects.length === 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 bg-slate-800 text-accent focus:ring-accent accent-purple-600 h-4 w-4 cursor-pointer"
                    title="Sélectionner tous les projets en attente"
                  />
                </TableHead>
                <TableHead>Projet</TableHead>
                <TableHead>Porteur</TableHead>
                <TableHead>Objectif</TableHead>
                <TableHead>Collecté</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Risque</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={9} />
                  ))
                : projects.map((project) => (
                    <TableRow key={project.id} className={selectedProjectIds.includes(project.id) ? 'bg-purple-500/10' : ''}>
                      <TableCell className="text-center">
                        {project.status === 'PENDING' ? (
                          <input
                            type="checkbox"
                            checked={selectedProjectIds.includes(project.id)}
                            onChange={() => toggleSelect(project.id)}
                            className="rounded border-slate-700 bg-slate-800 text-accent focus:ring-accent accent-purple-600 h-4 w-4 cursor-pointer"
                          />
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-[var(--text-primary)]">{project.title}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{project.owner_username}</TableCell>
                      <TableCell className="font-medium text-[var(--text-primary)]">{formatCurrency(project.target_amount)}</TableCell>
                      <TableCell className="font-medium text-[var(--text-primary)]">{formatCurrency(project.collected_amount)}</TableCell>
                      <TableCell>
                        <div className="w-32">
                          <ProgressBar value={project.collected_amount} max={project.target_amount} size="sm" />
                          <p className="text-xs text-[var(--text-muted)] mt-1">{Math.min(Math.round((project.collected_amount / project.target_amount) * 100), 100)}%</p>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={project.status} /></TableCell>
                      <TableCell><RiskBadge level={project.risk_level} /></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1.5">
                          {project.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                loading={approveProject.isPending}
                                onClick={() => approveProject.mutate(project.id)}
                                title="Approuver"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                loading={rejectProject.isPending}
                                onClick={() => rejectProject.mutate(project.id)}
                                title="Rejeter"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteTarget(project)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-[var(--error)]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
          {!isLoading && projects.length === 0 && <EmptyState title="Aucun projet trouvé" />}
        </Card>
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le projet"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-[var(--error-light)] bg-[var(--error-light)] p-4">
            <AlertTriangle className="h-5 w-5 text-[var(--error)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--error)]">
              Cette action est irréversible. Le projet <strong>{deleteTarget?.title}</strong> sera définitivement supprimé.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteProject.isPending}>
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
