import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, Lock } from 'lucide-react'
import { Button } from '@/components/common'
import { useResetPassword } from '@/hooks'

const resetSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ResetFormData = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>()
  const _navigate = useNavigate()
  const { mutate: resetPassword, isPending, isSuccess, isError, error } = useResetPassword()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tokenValid, setTokenValid] = useState(() => !!(uid && token))

  const { register, handleSubmit, formState: { errors }, reset: resetForm } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    mode: 'onBlur',
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onSubmit = (data: ResetFormData) => {
    if (!uid || !token) return
    resetPassword(
      { uid, token, new_password: data.newPassword, confirm_password: data.confirmPassword },
      {
        onSuccess: () => {
          resetForm({ newPassword: '', confirmPassword: '' })
        },
        onError: () => {
          setTokenValid(false)
        },
      }
    )
  }

  if (!tokenValid && !isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-lg space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--error-light)] text-[var(--error)]">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Lien invalide ou expiré</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Ce lien de réinitialisation n'est plus actif ou a déjà été utilisé.
          </p>
          <Link to="/forgot-password" className="block pt-2">
            <Button variant="accent" className="w-full">Demander un nouveau lien</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Branding — Perfectly Horizontally & Vertically Centered */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col justify-center items-center p-12 lg:p-16 bg-gradient-to-br from-[#060a13] via-[#0c1221] to-[#131d30] text-white border-r border-[var(--border-subtle)]">
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[var(--accent)]/15 blur-3xl pointer-events-none" />

          {/* Centered Content Container */}
          <div className="relative z-10 max-w-md text-center flex flex-col items-center justify-center space-y-7 my-auto">
            <Link to="/" className="flex flex-col items-center gap-2.5 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#be185d] shadow-lg shadow-[var(--accent)]/30 transition-transform group-hover:scale-105">
                <span className="text-lg font-extrabold text-white">FS</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold tracking-tight text-white leading-tight">Fundsy</span>
                <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider mt-0.5">Fintech Crowdfunding</span>
              </div>
            </Link>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[var(--accent)]">
              <Lock className="h-6 w-6" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-white text-center">
              Nouveau mot de passe
            </h2>
            <p className="text-sm sm:text-base text-slate-300 text-center max-w-sm">
              Choisissez un mot de passe robuste d'au moins 8 caractères combinant chiffres et lettres.
            </p>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Protection de compte 256-bit SSL</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-lg space-y-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-8 sm:p-10 shadow-sm animate-fade-in">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">Réinitialiser le mot de passe</h1>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                Veuillez saisir votre nouveau mot de passe ci-dessous.
              </p>
            </div>

            {isSuccess ? (
              <div className="rounded-2xl border border-[var(--success-light)] bg-[var(--success-light)]/40 p-6 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--success-light)] text-[var(--success)]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Mot de passe modifié</h3>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
                  </p>
                </div>
                <Link to="/login" className="block pt-2">
                  <Button variant="primary" size="lg" className="w-full">
                    Se connecter
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {isError && (
                  <div className="rounded-2xl border border-[var(--error-light)] bg-[var(--error-light)]/40 p-4 text-xs font-semibold text-[var(--error)]">
                    {error?.message || 'Lien invalide ou expiré.'}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label form-label-required">
                    <span>Nouveau mot de passe</span>
                  </label>
                  <div className="form-control-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 caractères"
                      required
                      {...register('newPassword')}
                      disabled={isPending}
                      className="input-fintech input-with-icon-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="input-icon-right text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      aria-label="Afficher mot de passe"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="form-error">{errors.newPassword.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">
                    <span>Confirmer le mot de passe</span>
                  </label>
                  <div className="form-control-wrapper">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirmez le nouveau mot de passe"
                      required
                      {...register('confirmPassword')}
                      disabled={isPending}
                      className="input-fintech input-with-icon-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="input-icon-right text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      aria-label="Afficher confirmation"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={isPending}>
                  <span>Enregistrer le mot de passe</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
