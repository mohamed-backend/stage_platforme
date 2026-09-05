import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Send, Sparkles, AlertTriangle } from 'lucide-react'
import { Button, Input, Select, Card, CardTitle, RiskBadge } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import WizardLayout from '@/components/layout/WizardLayout'
import { useCreateProject, useSubmitProject } from '@/hooks'
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
  expected_return: z.number().min(0, 'Return must be positive').max(100, 'Invalid return'),
})

type ProjectFormData = z.infer<typeof projectSchema>

const WIZARD_STEPS = [
  { label: 'Infos & Catégorie' },
  { label: 'Finance & Durée' },
  { label: 'Médias & Docs' },
  { label: 'Risque & Validation' }
]

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const createProject = useCreateProject()
  const submitProject = useSubmitProject()
  const [currentStep, setCurrentStep] = useState(1)

  const { register, handleSubmit, trigger, watch, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
      risk_type: 'Obligation simple',
      category: 'Énergie',
      image: '',
      target_amount: 50000,
      duration_months: 24,
      risk_level: 'MEDIUM',
      expected_return: 9.5,
    },
  })

  const formValues = watch()

  const handleNext = async () => {
    let valid = false
    if (currentStep === 1) {
      valid = await trigger(['title', 'category', 'description'])
    } else if (currentStep === 2) {
      valid = await trigger(['target_amount', 'expected_return', 'duration_months'])
    } else if (currentStep === 3) {
      valid = await trigger(['image'])
    }
    
    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = (data: ProjectFormData, asDraft: boolean) => {
    const payload = {
      ...data,
      image: data.image || undefined,
      category: data.category || undefined,
      risk_level: data.risk_level as RiskLevel,
    }

    createProject.mutate(payload, {
      onSuccess: (response) => {
        const projectId = response.data.id
        if (!asDraft) {
          submitProject.mutate(projectId, {
            onSuccess: () => navigate('/projects/mine'),
            onError: () => navigate('/projects/mine'),
          })
        } else {
          navigate('/projects/mine')
        }
      },
    })
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <Link
          to="/projects/mine"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à mes projets
        </Link>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-1 text-xs font-bold text-[var(--accent)] mb-2 shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Nouvelle Campagne de Financement
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Créer un projet
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Renseignez les éléments de votre entreprise pour ouvrir la souscription aux investisseurs Fundsy.
          </p>
        </div>

        {createProject.isError && (
          <div className="rounded-2xl border border-[var(--error-light)] bg-[var(--error-light)]/40 p-4 text-xs font-semibold text-[var(--error)]">
            {(createProject.error as Error)?.message || 'Une erreur est survenue lors de la création.'}
          </div>
        )}

        <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
          <WizardLayout
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onNext={handleNext}
            onBack={handleBack}
            showNavigation={currentStep < 4}
          >
            {currentStep === 1 && (
              <Card>
                <CardTitle className="mb-4">Informations Générales</CardTitle>
                <div className="space-y-4">
                  <Input
                    label="Titre de la campagne"
                    placeholder="Ex: SolarFlow — Centrale Photovoltaïque Citoyenne"
                    required
                    {...register('title')}
                    error={errors.title?.message}
                  />

                  <Select
                    label="Catégorie de projet"
                    options={[
                      { value: 'Énergie', label: 'Énergie & Climat' },
                      { value: 'Immobilier', label: 'Immobilier Durable' },
                      { value: 'Santé', label: 'Santé & Biotech' },
                      { value: 'Tech', label: 'Tech & Digital' },
                      { value: 'Industrie', label: 'Industrie & PME' },
                    ]}
                    {...register('category')}
                    error={errors.category?.message}
                  />

                  <div className="form-group">
                    <label className="form-label form-label-required">
                      <span>Description & Thèse d'investissement</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Présentez les objectifs, l'impact et la viabilité financière de votre projet..."
                      {...register('description')}
                      className="input-fintech h-auto py-3 resize-y"
                    />
                    {errors.description && <p className="form-error">{errors.description.message}</p>}
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardTitle className="mb-4">Modalités Financières & Objectifs</CardTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Objectif de collecte (€)"
                    type="number"
                    placeholder="50000"
                    required
                    {...register('target_amount', { valueAsNumber: true })}
                    error={errors.target_amount?.message}
                  />

                  <Input
                    label="Taux de rendement cible annuel (%)"
                    type="number"
                    step="0.1"
                    placeholder="9.5"
                    required
                    {...register('expected_return', { valueAsNumber: true })}
                    error={errors.expected_return?.message}
                  />

                  <Input
                    label="Durée de l'opération (mois)"
                    type="number"
                    placeholder="24"
                    required
                    {...register('duration_months', { valueAsNumber: true })}
                    error={errors.duration_months?.message}
                  />
                </div>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardTitle className="mb-4">Médias & Documents</CardTitle>
                <div className="space-y-4">
                  <Input
                    label="URL de l'image de couverture"
                    placeholder="https://images.unsplash.com/..."
                    {...register('image')}
                    error={errors.image?.message}
                  />
                  <p className="text-xs text-[var(--text-muted)]">Plus de documents pourront être ajoutés après la création du brouillon.</p>
                </div>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardTitle className="mb-4">Automated Risk Score Preview & Submit</CardTitle>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Niveau de risque indicatif"
                      options={[
                        { value: 'LOW', label: 'Faible (LOW)' },
                        { value: 'MEDIUM', label: 'Modéré (MEDIUM)' },
                        { value: 'HIGH', label: 'Élevé (HIGH)' },
                      ]}
                      {...register('risk_level')}
                      error={errors.risk_level?.message}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-[var(--accent)]" />
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Aperçu du Profil de Risque</h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-[var(--text-secondary)]">Niveau sélectionné :</span>
                      <RiskBadge level={formValues.risk_level as RiskLevel || 'MEDIUM'} />
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      L'équipe Fundsy réalisera un audit complet de ces informations avant la publication finale du projet. 
                      Assurez-vous que toutes les données financières sont exactes.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                    <Button type="button" variant="secondary" onClick={handleBack}>
                      Retour
                    </Button>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        disabled={createProject.isPending}
                        onClick={handleSubmit((data) => onSubmit(data, true))}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Brouillon
                      </Button>
                      <Button
                        type="submit"
                        variant="accent"
                        size="md"
                        loading={createProject.isPending || submitProject.isPending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Soumettre
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </WizardLayout>
        </form>
      </div>
    </DashboardLayout>
  )
}
