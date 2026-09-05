import { useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Layers, CheckCircle2, Calendar, DollarSign } from 'lucide-react'
import { Button, Input, Select, Card, Skeleton, EmptyState } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { useMyProjects, useCreatePool } from '@/hooks'
import { formatCurrency, formatDate } from '@/utils'
import type { Project } from '@/types'

const poolSchema = z.object({
  project: z.string().min(1, 'Sélectionnez un projet'),
  minimum_investment: z.number().min(1, 'Le minimum doit être supérieur à 0'),
  start_date: z.string().min(1, 'La date de début est requise'),
  end_date: z.string().min(1, 'La date de fin est requise'),
}).refine((data) => {
  if (!data.start_date || !data.end_date) return true
  return new Date(data.end_date) > new Date(data.start_date)
}, {
  message: 'La date de fin doit être après la date de début',
  path: ['end_date'],
})

type PoolFormData = z.infer<typeof poolSchema>

const today = new Date().toISOString().slice(0, 10)
const inThreeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10)

export default function CreatePoolPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: projects, isLoading: projectsLoading } = useMyProjects()
  const createPool = useCreatePool()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PoolFormData>({
    resolver: zodResolver(poolSchema),
    mode: 'onBlur',
    defaultValues: {
      project: '',
      minimum_investment: 100,
      start_date: today,
      end_date: inThreeMonths,
    },
  })

  const eligibleProjects = useMemo<Project[]>(
    () => (projects?.results || []).filter((p: any) => p.status === 'PUBLISHED'),
    [projects]
  )

  const selectedProjectId = watch('project')
  const selectedProject = useMemo(
    () => eligibleProjects.find((p) => String(p.id) === selectedProjectId),
    [eligibleProjects, selectedProjectId]
  )

  const onSubmit = (data: PoolFormData) => {
    createPool.mutate(
      {
        project: Number(data.project),
        minimum_investment: data.minimum_investment,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      },
      {
        onSuccess: (response) => {
          navigate(`/pools/${response.data.id}`)
        },
      }
    )
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          to="/pools/mine"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à mes pools
        </Link>

        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold tracking-tight">
            Créer un pool d'investissement
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-base">
            Associez un pool à l'un de vos projets publiés pour collecter les investissements.
          </p>
        </div>

        {createPool.isError && (
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--error-light)', color: 'var(--error)' }}
          >
            <p className="text-sm">
              {(createPool.error as Error)?.message || 'Une erreur est survenue lors de la création du pool.'}
            </p>
          </div>
        )}

        {projectsLoading ? (
          <Card>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ) : eligibleProjects.length === 0 ? (
          <EmptyState
            title="Aucun projet publié"
            description="Vous devez d'abord publier un projet pour pouvoir lui associer un pool."
            icon={<Layers className="h-7 w-7" style={{ color: 'var(--text-muted)' }} />}
            action={
              <Link to="/projects/mine">
                <Button>Voir mes projets</Button>
              </Link>
            }
          />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Projet associé</h2>
              <p style={{ color: 'var(--text-secondary)' }} className="mt-1 text-sm">
                Sélectionnez un projet publié pour lequel créer le pool.
              </p>

              <div className="mt-5">
                <Select
                  label="Projet"
                  {...register('project')}
                  error={errors.project?.message}
                  disabled={createPool.isPending}
                  options={eligibleProjects.map((p) => ({
                    value: String(p.id),
                    label: p.title,
                  }))}
                  placeholder="Choisir un projet..."
                />

                {selectedProject && (
                  <div className="mt-4 rounded-xl p-4" style={{ background: 'var(--surface-secondary)' }}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: 'var(--success)' }} />
                      <div>
                        <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">
                          {selectedProject.title}
                        </p>
                        <p style={{ color: 'var(--text-muted)' }} className="mt-1 text-xs">
                          Objectif : {formatCurrency(selectedProject.target_amount)} •{' '}
                          {selectedProject.duration_months} mois
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Paramètres du pool</h2>

              <div className="mt-5 space-y-4">
                <Input
                  label="Investissement minimum (€)"
                  type="number"
                  step="1"
                  leftIcon={<DollarSign className="h-4 w-4" />}
                  {...register('minimum_investment', { valueAsNumber: true })}
                  error={errors.minimum_investment?.message}
                  disabled={createPool.isPending}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Date de début"
                    type="date"
                    leftIcon={<Calendar className="h-4 w-4" />}
                    {...register('start_date')}
                    error={errors.start_date?.message}
                    disabled={createPool.isPending}
                  />
                  <Input
                    label="Date de fin"
                    type="date"
                    leftIcon={<Calendar className="h-4 w-4" />}
                    {...register('end_date')}
                    error={errors.end_date?.message}
                    disabled={createPool.isPending}
                  />
                </div>
              </div>
            </Card>

            {selectedProject && (
              <Card>
                <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Aperçu</h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl p-4 text-center" style={{ background: 'var(--surface-secondary)' }}>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs font-medium uppercase tracking-wider">
                      Objectif
                    </p>
                    <p style={{ color: 'var(--text-primary)' }} className="mt-1 text-base font-bold">
                      {formatCurrency(selectedProject.target_amount)}
                    </p>
                  </div>
                  <div className="rounded-xl p-4 text-center" style={{ background: 'var(--surface-secondary)' }}>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs font-medium uppercase tracking-wider">
                      Minimum
                    </p>
                    <p style={{ color: 'var(--text-primary)' }} className="mt-1 text-base font-bold">
                      {formatCurrency(watch('minimum_investment') || 0)}
                    </p>
                  </div>
                  <div className="rounded-xl p-4 text-center" style={{ background: 'var(--surface-secondary)' }}>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs font-medium uppercase tracking-wider">
                      Début
                    </p>
                    <p style={{ color: 'var(--text-primary)' }} className="mt-1 text-sm font-bold">
                      {watch('start_date') ? formatDate(watch('start_date')) : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl p-4 text-center" style={{ background: 'var(--surface-secondary)' }}>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs font-medium uppercase tracking-wider">
                      Fin
                    </p>
                    <p style={{ color: 'var(--text-primary)' }} className="mt-1 text-sm font-bold">
                      {watch('end_date') ? formatDate(watch('end_date')) : '—'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link to="/pools/mine" className="w-full sm:w-auto">
                <Button type="button" variant="outline" size="lg" className="w-full">
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                size="lg"
                loading={createPool.isPending}
                disabled={!selectedProject}
                className="w-full sm:w-auto"
              >
                <Layers className="h-4 w-4" />
                Créer le pool
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}