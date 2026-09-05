import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, EmptyState, Skeleton, Modal, Input, Badge } from '@/components/common'
import { useCoverageRules, useCreateCoverageRule, useDeleteCoverageRule } from '@/hooks'
import { formatCurrency, exportToCSV, exportToPDF } from '@/utils'
import { Shield, Plus, Trash2, CheckCircle2, XCircle, Download, Printer } from 'lucide-react'

export default function InsurerCoveragePage() {
  const location = useLocation()
  const { data: rules, isLoading, refetch } = useCoverageRules()
  const createRule = useCreateCoverageRule()
  const deleteRule = useDeleteCoverageRule()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_coverage: 100000,
    premium_rate: 2.5,
    risk_levels: ['LOW', 'MEDIUM'] as string[],
    is_active: true,
  })

  const rulesList = rules || []

  const handleExportCSV = () => {
    exportToCSV('rapport_regles_couverture_assurance', [
      { header: 'ID', accessor: (r) => r.id },
      { header: 'Nom de la règle', accessor: (r) => r.name },
      { header: 'Description', accessor: (r) => r.description },
      { header: 'Couverture max (€)', accessor: (r) => r.max_coverage },
      { header: 'Taux de prime (%)', accessor: (r) => r.premium_rate },
      { header: 'Niveaux de risque', accessor: (r) => r.risk_levels.join(', ') },
      { header: 'Statut', accessor: (r) => r.is_active ? 'Active' : 'Inactive' },
    ], rulesList)
  }

  const handleExportPDF = () => {
    exportToPDF('Rapport de Couverture et Règles d\'Assurance', [
      { header: 'Règle', accessor: (r) => r.name },
      { header: 'Couverture Max', accessor: (r) => formatCurrency(r.max_coverage) },
      { header: 'Prime', accessor: (r) => `${r.premium_rate}%` },
      { header: 'Risques couverts', accessor: (r) => r.risk_levels.join(', ') },
      { header: 'Statut', accessor: (r) => r.is_active ? 'Active' : 'Inactive' },
    ], rulesList)
  }

  const handleSubmit = () => {
    createRule.mutate(formData, {
      onSuccess: () => {
        setShowModal(false)
        setFormData({
          name: '',
          description: '',
          max_coverage: 100000,
          premium_rate: 2.5,
          risk_levels: ['LOW', 'MEDIUM'],
          is_active: true,
        })
        refetch()
      },
    })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Supprimer cette règle de couverture ?')) {
      deleteRule.mutate(id)
    }
  }

  const toggleRiskLevel = (level: string) => {
    setFormData((prev) => ({
      ...prev,
      risk_levels: prev.risk_levels.includes(level)
        ? prev.risk_levels.filter((l) => l !== level)
        : [...prev.risk_levels, level],
    }))
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Règles de couverture</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Paramétrez les critères et plafonds d'assurance applicables aux investissements.
            </p>
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
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle règle
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : !rules || rules.length === 0 ? (
          <EmptyState
            title="Aucune règle de couverture"
            description="Créez votre première règle d'assurance pour protéger les investissements."
            icon={<Shield className="h-7 w-7 text-[var(--text-muted)]" />}
            action={
              <Button onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Créer une règle
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rules.map((rule) => (
              <Card key={rule.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[var(--accent)]" />
                      <h3 className="text-base font-bold text-[var(--text-primary)]">{rule.name}</h3>
                    </div>
                    <Badge variant={rule.is_active ? 'success' : 'default'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">{rule.description}</p>

                  <div className="mt-4 space-y-2 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-3.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Couverture max</span>
                      <span className="font-bold text-[var(--text-primary)]">{formatCurrency(rule.max_coverage)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Taux prime</span>
                      <span className="font-bold text-[var(--text-primary)]">{rule.premium_rate}%</span>
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <p className="text-xs text-[var(--text-muted)] mb-1.5 font-medium">Niveaux de risque couverts</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.risk_levels.map((level) => (
                        <Badge key={level} variant={level === 'HIGH' ? 'danger' : level === 'MEDIUM' ? 'warning' : 'success'}>
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(rule.id)}
                    disabled={deleteRule.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouvelle règle de couverture"
      >
        <div className="space-y-4">
          <Input
            label="Nom de la règle"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Couverture standard"
          />

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Décrivez la règle de couverture..."
              className="input-fintech h-auto py-2.5 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Couverture max (€)"
              type="number"
              value={formData.max_coverage}
              onChange={(e) => setFormData({ ...formData, max_coverage: Number(e.target.value) })}
            />
            <Input
              label="Taux prime (%)"
              type="number"
              step="0.5"
              value={formData.premium_rate}
              onChange={(e) => setFormData({ ...formData, premium_rate: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">Niveaux de risque</label>
            <div className="flex gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleRiskLevel(level)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                    formData.risk_levels.includes(level)
                      ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  {formData.risk_levels.includes(level) ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              loading={createRule.isPending}
              onClick={handleSubmit}
              disabled={!formData.name.trim() || formData.risk_levels.length === 0}
            >
              Créer la règle
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
