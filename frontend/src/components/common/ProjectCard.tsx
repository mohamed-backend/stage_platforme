import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatPercent, getProgressPercent } from '@/utils'
import { TrendingUp, Users, ArrowUpRight } from 'lucide-react'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  variant?: 'default' | 'compact' | 'featured'
}

const statusBadgeClasses: Record<string, string> = {
  ACTIVE: 'badge-success',
  PUBLISHED: 'badge-success',
  FUNDED: 'badge-info',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  DRAFT: 'badge-warning',
  PENDING: 'badge-warning',
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Ouvert',
  PUBLISHED: 'Ouvert',
  FUNDED: 'Financé',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  DRAFT: 'Bientôt',
  PENDING: 'En revue',
}

// Fallback images curated by category
const categoryFallbacks: Record<string, string> = {
  tech: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  technologie: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  energie: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
  environnement: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80',
  immobilier: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  sante: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  commerce: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
}

function getFallbackImage(category?: string): string {
  if (!category) return categoryFallbacks.default
  const cleanCat = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const [key, url] of Object.entries(categoryFallbacks)) {
    if (cleanCat.includes(key)) return url
  }
  return categoryFallbacks.default
}

export function ProjectCard({ project }: ProjectCardProps) {
  const fallbackImg = getFallbackImage(project.category)
  const [imgSrc, setImgSrc] = useState<string>(project.image || fallbackImg)
  const [hasImgError, setHasImgError] = useState(false)

  const percent = getProgressPercent(project.collected_amount, project.target_amount)
  const statusLabel = statusLabels[project.status] || 'Bientôt'
  const badgeClass = statusBadgeClasses[project.status] || 'badge-draft'

  const hasValidReturn =
    project.expected_return !== undefined &&
    project.expected_return !== null &&
    project.expected_return > 0 &&
    project.expected_return <= 100

  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      {/* Thumbnail Header */}
      <div className="project-card-thumb">
        <img
          src={imgSrc}
          alt={project.title}
          loading="lazy"
          onError={() => {
            if (!hasImgError) {
              setHasImgError(true)
              setImgSrc(fallbackImg)
            }
          }}
          className="project-card-image"
        />

        <div className="project-card-overlay" />

        {/* Status Badge */}
        <div className="project-card-status-badge">
          <span className={`badge ${badgeClass}`}>
            {statusLabel}
          </span>
        </div>

        {/* Category Pill */}
        {project.category && (
          <div className="project-card-category-pill">
            <span className="badge badge-neutral">
              {project.category}
            </span>
          </div>
        )}

        {/* Duration */}
        <div className="project-card-thumb-meta">
          {project.duration_months && (
            <span>{project.duration_months} mois</span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="project-card-body">
        <div>
          <h3 className="project-card-title">{project.title}</h3>
        </div>

        {/* Financial Info */}
        <div className="project-card-stats">
          <div>
            <p className="project-card-stat-label">Objectif</p>
            <p className="project-card-stat-value">{formatCurrency(project.target_amount, 0)}</p>
          </div>
          <div>
            <p className="project-card-stat-label">Collecté</p>
            <p className="project-card-stat-value">{formatCurrency(project.collected_amount, 0)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="project-card-progress-wrap">
          <div className="project-card-progress-header">
            <span className="project-card-progress-percent">{percent}%</span>
            <span className="project-card-progress-label">financé</span>
          </div>
          <div className="project-card-progress-track">
            <div
              className="project-card-progress-bar"
              style={{ width: `${Math.max(percent, percent > 0 ? 3 : 0)}%` }}
            />
          </div>
        </div>

        {/* Meta Footer */}
        <div className="project-card-footer">
          <div className="flex items-center gap-3">
            <span className="project-card-investors">
              <Users width={15} height={15} />
              {project.investor_count || 0}
            </span>
            {hasValidReturn && (
              <span className="project-card-return-badge">
                <TrendingUp width={14} height={14} />
                {formatPercent(project.expected_return)}
              </span>
            )}
          </div>
          <span className="project-card-action">
            Découvrir
            <ArrowUpRight width={15} height={15} />
          </span>
        </div>
      </div>
    </Link>
  )
}
