import { useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Button, Input, Select, Skeleton, EmptyState } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { useProject, useUpdateProject } from '@/hooks'
import type { RiskLevel } from '@/types'

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  risk_type: z.string().min(1, 'Risk type is required'),
  category: z.string().optional(),
  image: z.string().url('Invalid URL').optional().or(z.literal('')),
  target_amount: z.number().min(1000, 'Minimum amount is 1,000'),
  duration_months: z.number().min(1, 'Minimum duration: 1 month').max(120, 'Maximum duration: 120 months'),
  risk_level: z.string().min(1, 'Risk level is required'),
  expected_return: z.number().min(0, 'Le rendement doit être positif').max(100, 'Rendement invalide'),
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: project, isLoading, error } = useProject(id)
  const updateProject = useUpdateProject()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description,
        risk_type: project.risk_type || '',
        category: project.category || '',
        image: project.image || '',
        target_amount: project.target_amount,
        duration_months: project.duration_months,
        risk_level: project.risk_level,
        expected_return: project.expected_return,
      })
    }
  }, [project, reset])

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-48" />
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !project) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <EmptyState
          title="Projet introuvable"
          description="Ce projet n'existe pas ou vous n'avez pas les permissions."
          action={<Link to="/projects/mine"><Button>Retour à mes projets</Button></Link>}
        />
      </DashboardLayout>
    )
  }

  const canEdit = project.status === 'DRAFT' || project.status === 'REJECTED'

  if (!canEdit) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <EmptyState
          title="Modification impossible"
          description={`Ce projet est en statut "${project.status}" et ne peut plus être modifié.`}
          action={<Link to="/projects/mine"><Button>Retour à mes projets</Button></Link>}
        />
      </DashboardLayout>
    )
  }

  const onSubmit = (data: ProjectFormData) => {
    const payload = {
      ...data,
      image: data.image || undefined,
      category: data.category || undefined,
      risk_level: data.risk_level as RiskLevel,
    }

    updateProject.mutate(
      { id: Number(id), data: payload },
      {
        onSuccess: () => navigate('/projects/mine'),
      }
    )
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <Link
          to="/projects/mine"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à mes projets
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">Modifier le projet</h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Mettez à jour les informations de votre campagne de financement.
          </p>
        </div>

        {updateProject.isError && (
          <div className="rounded-2xl border border-[var(--error-light)] bg-[var(--error-light)]/40 p-4">
            <p className="text-xs font-semibold text-[var(--error)]">
              {(updateProject.error as Error)?.message || 'Une erreur est survenue lors de la mise à jour.'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Informations générales</h2>
            <div className="space-y-4">
              <Input
                label="Titre du projet"
                placeholder="Ex: Extension d'un restaurant bio"
                {...register('title')}
                error={errors.title?.message}
                disabled={updateProject.isPending}
              />

              <div className="form-group">
                <label className="form-label form-label-required">
                  <span>Description</span>
                </label>
                <div className="form-control-wrapper">
                  <textarea
                    {...register('description')}
                    rows={5}
                    placeholder="Décrivez votre projet en détail..."
                    disabled={updateProject.isPending}
                    className="input-fintech h-auto py-3 text-sm leading-relaxed"
                  />
                </div>
                {errors.description && <p className="form-error text-xs">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Type de risque"
                  placeholder="Ex: Immobilier, Technologie..."
                  {...register('risk_type')}
                  error={errors.risk_type?.message}
                  disabled={updateProject.isPending}
                />

                <Input
                  label="Catégorie (optionnel)"
                  placeholder="Ex: GreenTech, Health..."
                  {...register('category')}
                  error={errors.category?.message}
                  disabled={updateProject.isPending}
                />
              </div>

              <Input
                label="URL de l'image (optionnel)"
                placeholder="https://example.com/image.jpg"
                {...register('image')}
                error={errors.image?.message}
                disabled={updateProject.isPending}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Informations financières</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Montant objectif (€)"
                  type="number"
                  {...register('target_amount', { valueAsNumber: true })}
                  error={errors.target_amount?.message}
                  disabled={updateProject.isPending}
                />

                <Input
                  label="Durée (mois)"
                  type="number"
                  {...register('duration_months', { valueAsNumber: true })}
                  error={errors.duration_months?.message}
                  disabled={updateProject.isPending}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Niveau de risque"
                  {...register('risk_level')}
                  error={errors.risk_level?.message}
                  disabled={updateProject.isPending}
                  options={[
                    { value: 'LOW', label: 'Faible' },
                    { value: 'MEDIUM', label: 'Moyen' },
                    { value: 'HIGH', label: 'Élevé' },
                  ]}
                />

                <Input
                  label="Rendement attendu (%)"
                  type="number"
                  step="0.5"
                  {...register('expected_return', { valueAsNumber: true })}
                  error={errors.expected_return?.message}
                  disabled={updateProject.isPending}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/projects/mine">
              <Button type="button" variant="ghost" size="lg">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={updateProject.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
