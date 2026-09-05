import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { useAuthStore } from '@/store'
import { useKyc } from '@/hooks'

interface KycAlertBannerProps {
  className?: string
  compact?: boolean
}

export function KycAlertBanner({ className = '', compact = false }: KycAlertBannerProps) {
  const { user } = useAuthStore()
  const { data: kycData } = useKyc()

  const status = kycData?.status || user?.kyc_status || 'NOT_SUBMITTED'

  if (status === 'APPROVED') {
    return null
  }

  const statusInfo = {
    NOT_SUBMITTED: {
      title: 'KYC Approval Required to Invest',
      description: 'You must verify your identity before submitting investments or purchasing secondary market deals.',
      badge: 'Verification Required',
      actionText: 'Complete Verification Now',
      bgClass: 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200',
      iconClass: 'text-amber-500',
    },
    PENDING: {
      title: 'KYC Verification Under Review',
      description: 'Your identity documents are currently being processed by our compliance team.',
      badge: 'Under Review',
      actionText: 'View Verification Status',
      bgClass: 'border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-200',
      iconClass: 'text-sky-500',
    },
    UNDER_REVIEW: {
      title: 'KYC Verification Under Review',
      description: 'Your identity documents are currently being processed by our compliance team.',
      badge: 'Under Review',
      actionText: 'View Verification Status',
      bgClass: 'border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-200',
      iconClass: 'text-sky-500',
    },
    REJECTED: {
      title: 'KYC Verification Rejected',
      description: kycData?.rejection_reason || 'Your identity verification was rejected. Please upload updated identification documents.',
      badge: 'Verification Rejected',
      actionText: 'Re-upload Verification Documents',
      bgClass: 'border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200',
      iconClass: 'text-rose-500',
    },
  }

  const statusKey = (status && status in statusInfo ? status : 'NOT_SUBMITTED') as keyof typeof statusInfo
  const currentInfo = statusInfo[statusKey]

  if (compact) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={`flex items-center justify-between rounded-xl border p-3 text-xs shadow-xs transition-all ${currentInfo.bgClass} ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <ShieldAlert className={`h-4 w-4 shrink-0 ${currentInfo.iconClass}`} />
          <span className="font-semibold truncate">{currentInfo.title}</span>
        </div>
        <Link
          to="/kyc"
          className="ml-3 shrink-0 inline-flex items-center gap-1 font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
        >
          <span>{currentInfo.actionText}</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition-all ${currentInfo.bgClass} ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/40 dark:bg-black/20 backdrop-blur-xs">
            {status === 'PENDING' || status === 'UNDER_REVIEW' ? (
              <Clock className={`h-5 w-5 ${currentInfo.iconClass}`} />
            ) : status === 'APPROVED' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <ShieldAlert className={`h-5 w-5 ${currentInfo.iconClass}`} />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight">{currentInfo.title}</h4>
              <span className="inline-flex items-center rounded-full bg-white/50 dark:bg-black/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                {currentInfo.badge}
              </span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed max-w-xl">{currentInfo.description}</p>
          </div>
        </div>

        <Link
          to="/kyc"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <span>{currentInfo.actionText}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
