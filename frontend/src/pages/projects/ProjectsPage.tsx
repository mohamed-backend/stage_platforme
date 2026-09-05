import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useProjects } from '@/hooks'
import { EmptyState, ProjectCard, Skeleton } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { Search, SlidersHorizontal, Sparkles, TrendingUp } from 'lucide-react'
import type { Project } from '@/types'

const CATEGORIES = [
  { id: '', label: 'Toutes les catégories' },
  { id: 'Énergie', label: 'Énergie & Climat' },
  { id: 'Immobilier', label: 'Immobilier Durable' },
  { id: 'Santé', label: 'Santé & Biotech' },
  { id: 'Tech', label: 'Tech & IA' },
  { id: 'Industrie', label: 'Industrie & PME' },
]

export default function ProjectsPage() {
  const location = useLocation()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [status, setStatus] = useState('PUBLISHED')
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 250)
    return () => clearTimeout(timer)
  }, [searchInput])

  const apiParams: Record<string, string | number> = { page_size: '30' }
  if (debouncedSearch) apiParams.search = debouncedSearch
  if (status) apiParams.status = status
  if (sort === 'recent') apiParams.ordering = '-created_at'
  else if (sort === 'ending') apiParams.ordering = 'end_date'
  else if (sort === 'amount') apiParams.ordering = '-collected_amount'
  else if (sort === 'return') apiParams.ordering = '-expected_return'

  const { data, isLoading } = useProjects(apiParams)
  let projects: Project[] = data?.results || []

  if (selectedCategory) {
    projects = projects.filter((p) =>
      p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
    )
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header — Minimalist & Punchy */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Les opportunités
          </h1>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-1 text-xs font-semibold text-[var(--accent)] shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Opportunités Certifiées</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search input with generous padding & perfectly aligned icon */}
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] flex items-center">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Rechercher un projet, secteur..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-fintech !pl-11 !pr-4"
              />
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="select-fintech w-auto min-w-[130px]"
              >
                <option value="PUBLISHED">Ouvert</option>
                <option value="">Tous statuts</option>
                <option value="FUNDED">Financé</option>
                <option value="CLOSED">Clôturé</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="select-fintech w-auto min-w-[140px]"
              >
                <option value="recent">Plus récents</option>
                <option value="ending">Bientôt terminés</option>
                <option value="amount">Montant collecté</option>
                <option value="return">Meilleur rendement</option>
              </select>
            </div>
          </div>

          {/* Minimalist Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-[var(--border-subtle)]">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Counter */}
        {!isLoading && (
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            <span>{projects.length} opportunité{projects.length > 1 ? 's' : ''} disponible{projects.length > 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1.5 text-[var(--success)]">
              <TrendingUp className="h-3.5 w-3.5" /> Rendement moyen : 9.8% / an
            </span>
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 space-y-3">
                <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="Aucune opportunité trouvée"
            description="Essayez de modifier vos critères de recherche ou de réinitialiser vos filtres."
            action={
              <button
                onClick={() => { setSearchInput(''); setSelectedCategory(''); setStatus(''); }}
                className="btn btn-secondary btn-sm"
              >
                Réinitialiser les filtres
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
